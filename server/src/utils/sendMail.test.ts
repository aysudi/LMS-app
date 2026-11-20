import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import nodemailer from "nodemailer";
import {
  createEmailSender,
  type BrevoTransportOptions,
  type EmailTransport,
} from "./sendMail";

const config = {
  BREVO_SMTP_USER: "smtp-user",
  BREVO_SMTP_PASS: "smtp-password",
  EMAIL_FROM: "verified@example.test",
  EMAIL_FROM_NAME: "Skillify Test",
} as typeof import("../configs/config").default;

const makeTransport = () => {
  const messages: nodemailer.SendMailOptions[] = [];
  let verifyCalls = 0;
  const transport: EmailTransport = {
    sendMail: async (message) => {
      messages.push(message);
      return { messageId: "mock-message-id" } as nodemailer.SentMessageInfo;
    },
    verify: async () => {
      verifyCalls += 1;
      return true as const;
    },
  };

  return { messages, transport, getVerifyCalls: () => verifyCalls };
};

test("shared sender uses centralized Brevo settings and sends an attachment", async () => {
  const fake = makeTransport();
  let transportOptions: BrevoTransportOptions | undefined;
  let transportCreations = 0;
  const sender = createEmailSender(config, (options) => {
    transportOptions = options;
    transportCreations += 1;
    return fake.transport;
  });
  const attachment = {
    filename: "certificate.pdf",
    content: Buffer.from("mock PDF"),
    contentType: "application/pdf",
  };

  await sender.send(
    "student@example.test",
    "Certificate",
    "<p>Attached</p>",
    "Attached",
    [attachment],
  );
  await sender.send("student@example.test", "Second", "<p>Second</p>");

  assert.equal(transportCreations, 1);
  assert.equal(transportOptions?.host, "smtp-relay.brevo.com");
  assert.equal(transportOptions?.port, 587);
  assert.deepEqual(transportOptions?.auth, {
    user: "smtp-user",
    pass: "smtp-password",
  });
  assert.equal(
    fake.messages[0].from,
    '"Skillify Test" <verified@example.test>',
  );
  assert.deepEqual(fake.messages[0].attachments, [attachment]);
  assert.equal(fake.messages.length, 2);
});

test("shared sender refuses missing credentials instead of silently skipping delivery", async () => {
  let transportCreations = 0;
  const sender = createEmailSender(
    { ...config, BREVO_SMTP_PASS: undefined },
    () => {
      transportCreations += 1;
      return makeTransport().transport;
    },
  );

  await assert.rejects(
    sender.send("student@example.test", "Subject", "<p>Body</p>"),
    /BREVO_SMTP_USER and BREVO_SMTP_PASS are required/,
  );
  assert.equal(transportCreations, 0);
});

test("shared sender refuses a missing sender address", async () => {
  const sender = createEmailSender(
    { ...config, EMAIL_FROM: undefined },
    () => makeTransport().transport,
  );

  await assert.rejects(
    sender.send("student@example.test", "Subject", "<p>Body</p>"),
    /EMAIL_FROM is required/,
  );
});

test("shared sender rejects an empty recipient and verifies transport without sending", async () => {
  const fake = makeTransport();
  const sender = createEmailSender(config, () => fake.transport);

  await assert.rejects(
    sender.send("  ", "Subject", "<p>Body</p>"),
    /recipient is required/,
  );
  assert.equal(await sender.verify(), true);
  assert.equal(fake.getVerifyCalls(), 1);
  assert.equal(fake.messages.length, 0);
});

test("shared sender reports provider send failures without leaking credentials", async () => {
  const fake = makeTransport();
  fake.transport.sendMail = async () => {
    throw Object.assign(new Error("provider error"), { code: "EAUTH" });
  };
  const sender = createEmailSender(config, () => fake.transport);
  const originalConsoleError = console.error;
  const logged: unknown[][] = [];
  console.error = (...args: unknown[]) => logged.push(args);

  try {
    await assert.rejects(
      sender.send("student@example.test", "Subject", "<p>Body</p>"),
      /Email delivery failed/,
    );
  } finally {
    console.error = originalConsoleError;
  }

  assert.deepEqual(logged, [["Email delivery failed (EAUTH)"]]);
  assert.equal(fake.messages.length, 0);
});

test("each existing email template delegates delivery to the shared sender", async () => {
  const [mailSource, contactSource] = await Promise.all([
    readFile(`${process.cwd()}/src/utils/sendMail.ts`, "utf8"),
    readFile(`${process.cwd()}/src/utils/emailService.ts`, "utf8"),
  ]);
  const templateNames = [
    "sendVerificationEmail",
    "sendUnlockAccountEmail",
    "sendForgotPasswordEmail",
    "sendNotificationEmail",
    "sendCertificateEmail",
    "sendApplicationApprovedEmail",
    "sendApplicationReceivedEmail",
    "sendApplicationRejectedEmail",
    "sendCourseApprovedEmail",
    "sendCourseRejectedEmail",
  ];

  for (const name of templateNames) {
    const start = mailSource.indexOf(`export const ${name} =`);
    const next = mailSource.indexOf("\nexport const ", start + 1);
    const implementation = mailSource.slice(
      start,
      next === -1 ? mailSource.length : next,
    );

    assert.notEqual(start, -1, `${name} exists`);
    assert.match(implementation, /sendEmail\(/, `${name} uses shared sender`);
  }

  for (const name of [
    "sendContactNotificationEmail",
    "sendContactReplyEmail",
  ]) {
    const start = contactSource.indexOf(`export const ${name} =`);
    const next = contactSource.indexOf("\nexport const ", start + 1);
    const implementation = contactSource.slice(
      start,
      next === -1 ? contactSource.length : next,
    );

    assert.notEqual(start, -1, `${name} exists`);
    assert.match(implementation, /sendEmail\(/, `${name} uses shared sender`);
  }
});
