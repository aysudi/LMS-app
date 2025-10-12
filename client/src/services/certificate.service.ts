export interface CertificateData {
  studentName: string;
  courseName: string;
  instructorName: string;
  completionDate: Date;
  courseId: string;
  userId: string;
  certificateId: string;
}

// We'll use a service like PDFKit or canvas-based generation
// For now, let's create a service that can be extended with actual PDF generation
export class CertificateService {
  static async generateCertificate(data: CertificateData): Promise<{
    success: boolean;
    certificateId?: string;
    emailSent?: boolean;
    message?: string;
  }> {
    try {
      const response = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify({
          courseId: data.courseId,
          userId: data.userId,
          studentName: data.studentName,
          instructorName: data.instructorName,
          userEmail: localStorage.getItem("userEmail") || "user@example.com",
          courseName: data.courseName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to generate certificate");
      }

      return {
        success: result.success,
        certificateId: result.data?.certificateId,
        emailSent: result.data?.emailSent,
        message: result.message,
      };
    } catch (error) {
      console.error("Certificate generation error:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate certificate",
      };
    }
  }

  private static generateCertificateHTML(data: CertificateData): string {
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
            padding: 40px;
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .certificate {
            width: 800px;
            height: 600px;
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
            font-size: 32px;
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
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 20px;
          }
          
          .student-name {
            font-family: 'Playfair Display', serif;
            font-size: 36px;
            font-weight: 700;
            color: #2d3748;
            margin: 20px 0;
            position: relative;
            display: inline-block;
          }
          
          .student-name::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 200px;
            height: 2px;
            background: linear-gradient(90deg, #667eea, #764ba2);
          }
          
          .course-text {
            font-size: 18px;
            color: #4a5568;
            margin: 30px 0 20px;
          }
          
          .course-name {
            font-size: 24px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 30px;
          }
          
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
          }
          
          .instructor-info {
            text-align: left;
          }
          
          .instructor-name {
            font-size: 16px;
            font-weight: 600;
            color: #2d3748;
          }
          
          .instructor-title {
            font-size: 14px;
            color: #718096;
          }
          
          .date-info {
            text-align: right;
          }
          
          .completion-date {
            font-size: 16px;
            font-weight: 500;
            color: #2d3748;
          }
          
          .certificate-id {
            font-size: 12px;
            color: #a0aec0;
            margin-top: 5px;
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
              <div class="certificate-id">Certificate ID: ${
                data.certificateId
              }</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static generateCertificateId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `CERT-${timestamp}-${randomStr}`.toUpperCase();
  }
}

// Email service integration for sending certificates
export class EmailService {
  static async sendCertificateEmail(
    email: string,
    studentName: string,
    courseName: string,
    certificateBuffer: Buffer
  ): Promise<boolean> {
    try {
      // This is a placeholder - integrate with your email service
      // Examples: SendGrid, AWS SES, Nodemailer, etc.

      console.log(`Sending certificate email to ${email}`);
      console.log(`Student: ${studentName}`);
      console.log(`Course: ${courseName}`);
      console.log(`Certificate size: ${certificateBuffer.length} bytes`);

      // In a real implementation:
      // 1. Use an email service like SendGrid
      // 2. Create an email template
      // 3. Attach the certificate PDF
      // 4. Send the email

      return true;
    } catch (error) {
      console.error("Failed to send certificate email:", error);
      return false;
    }
  }
}

export default { CertificateService, EmailService };
