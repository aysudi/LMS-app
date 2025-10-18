import puppeteer from "puppeteer";
import { sendCertificateEmail as emailCertificate } from "../utils/sendMail";

export interface CertificateData {
  studentName: string;
  courseName: string;
  instructorName: string;
  completionDate: Date;
  courseId: string;
  userId: string;
  certificateId: string;
}

export const generateCertificate = async (
  data: CertificateData
): Promise<Buffer> => {
  try {
    const certificateHTML = generateCertificateHTML(data);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(certificateHTML, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      margin: {
        top: "0.2in",
        right: "0.2in",
        bottom: "0.2in",
        left: "0.2in",
      },
      preferCSSPageSize: true,
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("Certificate generation error:", error);
    throw new Error("Failed to generate certificate PDF");
  }
};

const generateCertificateHTML = (data: CertificateData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Certificate of Completion</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');
        
        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .certificate {
          width: 10.5in;
          height: 7in;
          background: white;
          border-radius: 20px;
          padding: 60px;
          box-sizing: border-box;
          position: relative;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .certificate::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 8px;
          background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .logo {
          font-size: 36px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
        }
        
        .title {
          font-family: 'Playfair Display', serif;
          font-size: 48px;
          font-weight: 700;
          color: #2d3748;
          margin: 20px 0;
          letter-spacing: 2px;
        }
        
        .subtitle {
          font-size: 18px;
          color: #718096;
          font-weight: 300;
        }
        
        .content {
          text-align: center;
          margin: 40px 0;
        }
        
        .present-text {
          font-size: 18px;
          color: #4a5568;
          margin-bottom: 20px;
        }
        
        .student-name {
          font-family: 'Playfair Display', serif;
          font-size: 42px;
          font-weight: 700;
          color: #2d3748;
          margin: 30px 0;
          position: relative;
          display: inline-block;
        }
        
        .student-name::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 300px;
          height: 2px;
          background: linear-gradient(90deg, #667eea, #764ba2);
        }
        
        .course-text {
          font-size: 20px;
          color: #4a5568;
          margin: 40px 0 20px;
        }
        
        .course-name {
          font-size: 28px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 40px;
        }
        
        .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 60px;
          padding-top: 30px;
          border-top: 2px solid #e2e8f0;
        }
        
        .instructor-info {
          text-align: left;
        }
        
        .instructor-name {
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 5px;
        }
        
        .instructor-title {
          font-size: 16px;
          color: #718096;
        }
        
        .date-info {
          text-align: right;
        }
        
        .completion-date {
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 5px;
        }
        
        .certificate-id {
          font-size: 14px;
          color: #a0aec0;
        }
        
        .decorative-elements {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
        }
        
        .decorative-circle {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
        }
        
        .circle-1 {
          width: 200px;
          height: 200px;
          top: -100px;
          right: -100px;
        }
        
        .circle-2 {
          width: 150px;
          height: 150px;
          bottom: -75px;
          left: -75px;
        }
        
        .seal {
          position: absolute;
          top: 32px;
          left: 23px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="decorative-elements">
          <div class="decorative-circle circle-1"></div>
          <div class="decorative-circle circle-2"></div>
        </div>
        
        <div class="header">
          <div class="logo">Skillify</div>
          <h1 class="title">Certificate of Completion</h1>
          <p class="subtitle">This is to certify that</p>
        </div>
        
        <div class="content">
          <div class="student-name">${data.studentName}</div>
          <p class="course-text">has successfully completed the course</p>
          <div class="course-name">${data.courseName}</div>
        </div>
        
        <div class="footer">
          <div class="instructor-info">
            <div class="instructor-name">${data.instructorName}</div>
            <div class="instructor-title">Course Instructor</div>
          </div>
          
          <div class="date-info">
            <div class="completion-date">${data.completionDate.toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}</div>
            <div class="certificate-id">ID: ${data.certificateId}</div>
          </div>
        </div>
        
        <div class="seal">
          <div>
            VERIFIED<br>
            SKILLIFY
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const sendCertificateEmail = async (
  email: string,
  studentName: string,
  courseName: string,
  certificateBuffer: Buffer,
  certificateId: string
): Promise<boolean> => {
  try {
    const subject = `🎉 Your Certificate of Completion - ${courseName}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Congratulations! 🎉</h1>
          <p style="color: #f8f9fa; margin: 10px 0 0 0; font-size: 16px;">You've earned your certificate!</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef; border-top: none;">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Dear ${studentName},</p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Congratulations on successfully completing <strong>"${courseName}"</strong>! 
            Your dedication and hard work have paid off.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin: 0 0 10px 0;">Certificate Details:</h3>
            <p style="color: #666; margin: 5px 0;"><strong>Course:</strong> ${courseName}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Completion Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Certificate ID:</strong> ${certificateId}</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Your certificate is attached to this email as a PDF file. You can download, print, 
            or share it to showcase your achievement.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://skillify.com" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
              Continue Learning
            </a>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Keep up the excellent work and continue your learning journey with us!
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Best regards,<br>
            <strong>The Skillify Team</strong>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>This certificate verifies the completion of the course on Skillify platform.</p>
          <p>Questions? Contact us at support@skillify.com</p>
        </div>
      </div>
    `;

    // Send email with certificate attachment
    await emailCertificate(
      email,
      subject,
      htmlContent,
      certificateBuffer,
      `certificate-${certificateId}.pdf`
    );

    return true;
  } catch (error) {
    console.error("Failed to send certificate email:", error);
    return false;
  }
};
