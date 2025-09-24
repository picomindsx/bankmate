import { leads } from "@/lib/consts";
import { Lead } from "@/types/common";

export const getDocumentCompletionStatus = (
  lead: Lead
): "pending" | "partial" | "complete" => {
  if (!lead.documents || lead.documents.length === 0) return "pending";

  const totalDocs = lead.documents.length;
  const verifiedDocs = lead.documents.filter(
    (doc) => doc.status === "verified"
  ).length;
  const providedDocs = lead.documents.filter(
    (doc) => doc.status === "provided"
  ).length;

  if (verifiedDocs === totalDocs) return "complete";
  if (providedDocs + verifiedDocs > 0) return "partial";
  return "pending";
};

export const updateDocumentStatus = (
  leadId: string,
  requirementId: string,
  status: "pending" | "provided" | "verified",
  verifiedBy?: string
): boolean => {
  const lead = leads.find((l) => l.id === leadId);
  if (lead && lead.documents) {
    const docIndex = lead.documents.findIndex(
      (doc) => doc.requirementId === requirementId
    );
    if (docIndex !== -1) {
      lead.documents[docIndex].status = status;
      if (status === "verified") {
        lead.documents[docIndex].verifiedAt = new Date().toISOString();
        lead.documents[docIndex].verifiedBy = verifiedBy;
      }
      lead.updatedAt = new Date().toISOString();
      lead.documentCompletionStatus = getDocumentCompletionStatus(lead);

      // Auto-update documentsSubmittedAt when first document is provided
      if (status === "provided" && !lead.documentsSubmittedAt) {
        lead.documentsSubmittedAt = new Date().toISOString();
      }

      return true;
    }
  }
  return false;
};

export const addDocumentFiles = (
  leadId: string,
  documentType: string,
  files: File[],
  isAdditional = false
): boolean => {
  const lead = leads.find((l) => l.id === leadId);
  if (lead && lead.documents) {
    const docIndex = lead.documents.findIndex(
      (doc) => doc.type === documentType
    );
    if (docIndex !== -1) {
      if (isAdditional) {
        lead.documents[docIndex].additionalFiles.push(...files);
      } else {
        lead.documents[docIndex].files.push(...files);
      }
      lead.documents[docIndex].uploadedAt = new Date().toISOString();
      lead.updatedAt = new Date().toISOString();
      return true;
    }
  }
  return false;
};
