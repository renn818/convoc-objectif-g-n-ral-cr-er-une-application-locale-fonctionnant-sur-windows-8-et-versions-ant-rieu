import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { Resolution, TYPE_VOTE_LABELS } from '@/types';

export async function exportToDocx(
  titre: string,
  resolutions: Resolution[],
  date: Date = new Date()
): Promise<Blob> {
  const children: Paragraph[] = [];
  
  children.push(
    new Paragraph({
      text: titre,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );
  
  children.push(
    new Paragraph({
      text: `Document généré le ${date.toLocaleDateString('fr-FR')}`,
      spacing: { after: 400 },
      alignment: AlignmentType.CENTER,
    })
  );
  
  for (const resolution of resolutions) {
    children.push(
      new Paragraph({
        text: `Résolution n°${resolution.numero}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    );
    
    children.push(
      new Paragraph({
        text: resolution.titre,
        spacing: { after: 200 },
      })
    );
    
    const contenuLines = resolution.contenu.split('\n').filter(l => l.trim());
    for (const line of contenuLines) {
      children.push(
        new Paragraph({
          text: line,
          spacing: { after: 100 },
        })
      );
    }
    
    children.push(
      new Paragraph({
        text: `Mode de vote : ${TYPE_VOTE_LABELS[resolution.typeVote]}`,
        spacing: { before: 200, after: 100 },
      })
    );
    
    children.push(
      new Paragraph({
        text: `Options : ${resolution.optionsVote.join(' - ')}`,
        spacing: { after: 300 },
      })
    );
  }
  
  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  });
  
  return await Packer.toBlob(doc);
}

export function exportToTxt(titre: string, resolutions: Resolution[], date: Date = new Date()): string {
  let content = '';
  
  content += '='.repeat(60) + '\n';
  content += titre.toUpperCase() + '\n';
  content += '='.repeat(60) + '\n\n';
  content += `Document généré le ${date.toLocaleDateString('fr-FR')}\n\n`;
  
  for (const resolution of resolutions) {
    content += '-'.repeat(40) + '\n';
    content += `RÉSOLUTION N°${resolution.numero}\n`;
    content += '-'.repeat(40) + '\n\n';
    content += `Titre: ${resolution.titre}\n\n`;
    content += resolution.contenu + '\n\n';
    content += `Mode de vote: ${TYPE_VOTE_LABELS[resolution.typeVote]}\n`;
    content += `Options: ${resolution.optionsVote.join(' | ')}\n\n`;
  }
  
  return content;
}