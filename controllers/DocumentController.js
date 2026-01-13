
import { Document } from '../models/index.js';
import { DocumentService } from '../services/DocumentService.js';
import path from 'path';

export class DocumentController {
  /**
   * Upload de pièce jointe (nécessite multer en middleware)
   */
  static async upload(req, res) {
    try {
      if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu.' });

      const { entityType, entityId } = req.body;
      
      const doc = await DocumentService.archiveDocument(req, req.file, {
        entityType: entityType || 'CONTRACT',
        entityId: entityId || 'GENERIC'
      });

      return res.status(201).json(doc);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Récupère la liste des documents liés à une entité (ex: Facture)
   */
  static async getEntityDocuments(req, res) {
    try {
      const { type, id } = req.params;
      const docs = await Document.findAll({
        where: {
          tenantId: req.user.tenantId,
          linkedEntityType: type.toUpperCase(),
          linkedEntityId: id
        }
      });
      return res.status(200).json(docs);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Téléchargement sécurisé avec vérification d'intégrité à la volée
   */
  static async download(req, res) {
    try {
      const { id } = req.params;
      const doc = await Document.findOne({ 
        where: { id, tenantId: req.user.tenantId } 
      });

      if (!doc) return res.status(404).json({ error: 'Document introuvable.' });

      // Vérification d'intégrité optionnelle (Sécurité Haute)
      const isIntegrityOk = await DocumentService.checkIntegrity(doc.id);
      if (!isIntegrityOk) {
        return res.status(403).json({ 
          error: 'IntegrityFailure', 
          message: 'Le document a été altéré sur le serveur.' 
        });
      }

      return res.download(doc.path, doc.originalName);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
