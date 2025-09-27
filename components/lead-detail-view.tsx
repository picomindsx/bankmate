import { LeadForm } from "@/types/common";
import {
  XCircle,
  User,
  Phone,
  Mail,
  Briefcase,
  CreditCard,
  MapPin,
  Building2,
  Clock,
  Badge,
  Edit,
  Users,
  Plus,
  CheckCircle,
  Key,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { useState } from "react";
import { getAllLeads } from "@/services/lead-service";
import EditLeadDialog from "./edit-lead-dialog";
import { LeadFormDetailsConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

const LeadDetailView = ({
  lead,
  setSelectedLead,
  setLeads,
}: {
  lead: LeadForm;
  setSelectedLead: (lead: LeadForm | null) => void;
  setLeads: (leads: LeadForm[]) => void;
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<LeadForm>>({});
  const getLeadTimeline = (lead: LeadForm) => {
    const timeline = [
      {
        stage: "Lead Created",
        date: lead.createdAt,
        status: "completed",
        icon: Plus,
      },

      {
        stage: "Bank Assignment",
        date: lead.bankAssignedAt || null,
        status: lead.bankSelection ? "completed" : "pending",
        icon: Building2,
      },
      {
        stage: "Application Status",
        date: lead.statusUpdatedAt || null,
        status: lead.applicationStatus === "pending" ? "pending" : "completed",
        icon: CheckCircle,
      },
    ];
    return timeline;
  };
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-white/20 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {lead.leadName || lead.clientName}
          </h2>
          <Button
            onClick={() => setSelectedLead(null)}
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            <XCircle className="h-6 w-6" />
          </Button>
        </div>

        <div className="">
          {/* Lead Information */}
          <div className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Lead Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-white">
                {Object.entries(lead).map(([key, value]) => {
                  const item = LeadFormDetailsConfig[key as keyof LeadForm];

                  const Icon = item?.icon;

                  return (
                    <>
                      {item && value ? (
                        <div className="flex items-center gap-2">
                          <Icon className={cn("h4-w4", item?.iconClassName)} />
                          <span className="text-sm">
                            <span className="text-gray-400">
                              {item?.label}:{" "}
                            </span>
                            {item.valueKeys
                              ? lead[item.valueKeys[0]] ||
                                lead[item.valueKeys[1]]
                              : value}
                          </span>
                        </div>
                      ) : (
                        ""
                      )}
                    </>
                  );
                })}
                {/* <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-300" />
                  <span className="text-sm">Client: {lead.clientName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-300" />
                  <span className="text-sm">Phone: {lead.contactNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-purple-300" />
                  <span className="text-sm">Email: {lead.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-orange-300" />
                  <span className="text-sm">Product: {lead.leadType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-yellow-300" />
                  <span className="text-sm">CIBIL: {lead.cibilScore}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-300" />
                  <span className="text-sm">
                    Address:{" "}
                    {lead.currentAddress || lead.permanentAddress || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-300" />
                  <span className="text-sm">
                    Bank: {lead.bankSelection || "Not assigned"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-teal-300" />
                  <span className="text-sm">
                    Staff: {lead.assignedStaffName || "Unassigned"}
                  </span>
                </div> */}
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          {/* <div className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Lead Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getLeadTimeline(lead).map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div
                        className={`p-2 rounded-full ${
                          item.status === "completed"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm">
                          {item.stage}
                        </h4>
                        <p className="text-gray-400 text-xs">
                          {item.date
                            ? new Date(item.date).toLocaleString()
                            : "Pending"}
                        </p>
                      </div>
                      <Badge
                        className={`${
                          item.status === "completed"
                            ? "bg-green-500/20 text-green-300 border-green-400/30"
                            : "bg-gray-500/20 text-gray-400 border-gray-400/30"
                        }`}
                      >
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                
              </CardContent>
            </Card>
          </div> */}
        </div>

        <div className="my-3">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              setSelectedLead(lead); // Ensure selectedLead is set
              setEditFormData(lead);
              setShowEditDialog(true);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Lead Details
          </Button>
        </div>
      </div>
      <EditLeadDialog
        open={showEditDialog}
        lead={lead}
        close={() => {
          setShowEditDialog(false);
        }}
        onEditSuccess={() => {
          getAllLeads().then((leadList) => setLeads(leadList));
          setShowEditDialog(false);
          setSelectedLead(null);
          setEditFormData({});
        }}
      />
    </div>
  );
};

export default LeadDetailView;
