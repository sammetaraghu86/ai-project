const PDFDocument = require('pdfkit');

/**
 * Generate a professional PDF resume from structured resume data
 */
function generateResumePDF(resumeData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 55, right: 55 }
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const colors = {
        primary: '#1a365d',
        secondary: '#2d3748',
        accent: '#3182ce',
        text: '#2d3748',
        muted: '#718096',
        line: '#e2e8f0'
      };

      const info = resumeData.personalInfo || {};
      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

      // --- Header ---
      doc.fontSize(24).fillColor(colors.primary).font('Helvetica-Bold')
        .text(info.name || 'Student Name', { align: 'center' });

      doc.moveDown(0.3);
      doc.fontSize(12).fillColor(colors.accent).font('Helvetica')
        .text(info.title || '', { align: 'center' });

      doc.moveDown(0.3);
      const contactParts = [info.email, info.phone, info.location].filter(Boolean);
      doc.fontSize(9).fillColor(colors.muted)
        .text(contactParts.join('  •  '), { align: 'center' });

      const linkParts = [info.linkedin, info.github, info.website].filter(Boolean);
      if (linkParts.length > 0) {
        doc.fontSize(9).fillColor(colors.accent)
          .text(linkParts.join('  •  '), { align: 'center' });
      }

      doc.moveDown(0.5);
      doc.moveTo(doc.page.margins.left, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .strokeColor(colors.line).lineWidth(1).stroke();
      doc.moveDown(0.5);

      // --- Helper: Section heading ---
      function sectionHeading(title) {
        doc.moveDown(0.3);
        doc.fontSize(12).fillColor(colors.primary).font('Helvetica-Bold')
          .text(title.toUpperCase(), { characterSpacing: 1.5 });
        doc.moveTo(doc.page.margins.left, doc.y + 2)
          .lineTo(doc.page.width - doc.page.margins.right, doc.y + 2)
          .strokeColor(colors.accent).lineWidth(0.5).stroke();
        doc.moveDown(0.5);
      }

      // --- Summary ---
      if (resumeData.summary) {
        sectionHeading('Professional Summary');
        doc.fontSize(10).fillColor(colors.text).font('Helvetica')
          .text(resumeData.summary, { lineGap: 2 });
      }

      // --- Experience ---
      if (resumeData.experience && resumeData.experience.length > 0) {
        sectionHeading('Experience');
        for (const exp of resumeData.experience) {
          doc.fontSize(11).fillColor(colors.secondary).font('Helvetica-Bold')
            .text(exp.title || '', { continued: true })
            .font('Helvetica').fillColor(colors.muted)
            .text(`  |  ${exp.company || ''}`, { continued: true })
            .text(`    ${exp.startDate || ''} - ${exp.endDate || ''}`, { align: 'right' });

          if (exp.location) {
            doc.fontSize(9).fillColor(colors.muted).font('Helvetica')
              .text(exp.location);
          }

          doc.moveDown(0.2);
          if (exp.bullets) {
            for (const bullet of exp.bullets) {
              doc.fontSize(10).fillColor(colors.text).font('Helvetica')
                .text(`•  ${bullet}`, { indent: 15, lineGap: 1 });
            }
          }
          doc.moveDown(0.4);
        }
      }

      // --- Education ---
      if (resumeData.education && resumeData.education.length > 0) {
        sectionHeading('Education');
        for (const edu of resumeData.education) {
          doc.fontSize(11).fillColor(colors.secondary).font('Helvetica-Bold')
            .text(edu.degree || '', { continued: true })
            .font('Helvetica').fillColor(colors.muted)
            .text(`    ${edu.graduationDate || ''}`, { align: 'right' });

          doc.fontSize(10).fillColor(colors.text).font('Helvetica')
            .text(edu.school || '');

          if (edu.gpa) {
            doc.fontSize(9).fillColor(colors.muted).text(`GPA: ${edu.gpa}`);
          }

          if (edu.highlights) {
            for (const h of edu.highlights) {
              doc.fontSize(9).fillColor(colors.text).text(`•  ${h}`, { indent: 15 });
            }
          }
          doc.moveDown(0.3);
        }
      }

      // --- Skills ---
      if (resumeData.skills) {
        sectionHeading('Skills');
        const skillSections = [];
        if (resumeData.skills.technical?.length) {
          skillSections.push(`Technical: ${resumeData.skills.technical.join(', ')}`);
        }
        if (resumeData.skills.soft?.length) {
          skillSections.push(`Soft Skills: ${resumeData.skills.soft.join(', ')}`);
        }
        if (resumeData.skills.tools?.length) {
          skillSections.push(`Tools: ${resumeData.skills.tools.join(', ')}`);
        }
        for (const line of skillSections) {
          doc.fontSize(10).fillColor(colors.text).font('Helvetica')
            .text(line, { lineGap: 2 });
        }
      }

      // --- Projects ---
      if (resumeData.projects && resumeData.projects.length > 0) {
        sectionHeading('Projects');
        for (const proj of resumeData.projects) {
          doc.fontSize(11).fillColor(colors.secondary).font('Helvetica-Bold')
            .text(proj.name || '');

          if (proj.technologies?.length) {
            doc.fontSize(9).fillColor(colors.accent).font('Helvetica')
              .text(proj.technologies.join(' • '));
          }

          doc.moveDown(0.2);
          if (proj.bullets) {
            for (const bullet of proj.bullets) {
              doc.fontSize(10).fillColor(colors.text).font('Helvetica')
                .text(`•  ${bullet}`, { indent: 15, lineGap: 1 });
            }
          }
          doc.moveDown(0.3);
        }
      }

      // --- Certifications ---
      if (resumeData.certifications && resumeData.certifications.length > 0) {
        sectionHeading('Certifications');
        for (const cert of resumeData.certifications) {
          doc.fontSize(10).fillColor(colors.text).font('Helvetica')
            .text(`•  ${cert}`, { indent: 15 });
        }
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generate a cover letter PDF
 */
function generateCoverLetterPDF(content, candidateName) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 72, bottom: 72, left: 72, right: 72 }
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Date
      doc.fontSize(10).fillColor('#718096').font('Helvetica')
        .text(new Date().toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        }));

      doc.moveDown(2);

      // Letter body
      doc.fontSize(11).fillColor('#2d3748').font('Helvetica')
        .text(content, { lineGap: 4, paragraphGap: 8 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateResumePDF, generateCoverLetterPDF };
