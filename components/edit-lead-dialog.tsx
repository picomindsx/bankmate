import { useAuth } from "@/hooks/use-auth";
import { updateLead } from "@/services/lead-service";
import {
  IGender,
  ILoanDocument,
  IUrgencyLevel,
  LeadForm,
  User,
} from "@/types/common";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  APPLICATION_STATUS,
  BANK_STATUS,
  BANKS,
  DOCUMENT_STATUS,
  GENDER_OPTIONS,
  INCOME_CATEGORY,
  LEAD_SOURCES,
  LOAN_DOCUMENTS,
  LOAN_TYPES,
} from "@/lib/consts";
import { Textarea } from "./ui/textarea";
import { getAllStaff } from "@/services/staff-service";
import { Calendar, TrendingUp, X } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import {
  getBankStatusColor,
  getDocumentStatusColor,
  getStatusColor,
} from "@/lib/utils";

const EditLeadDialog = ({
  lead,
  open,
  close,
  onEditSuccess,
}: {
  lead: LeadForm | null;
  open: boolean;
  close: () => void;
  onEditSuccess?: () => void;
}) => {
  const { user } = useAuth();

  const [editFormData, setEditFormData] = useState<Partial<LeadForm>>({});

  const [staff, setStaff] = useState<User[]>([]);

  const handleEditLead = async () => {
    if (!lead || !user) return;

    const updatedLead: LeadForm = {
      ...lead,
      ...editFormData,

      statusUpdatedAt: new Date().toISOString(), // Update statusUpdatedAt on any edit
    };

    const success = await updateLead(lead.id!, updatedLead);
    if (success) {
      // getBranchLeads(branchId).then((branchLeads) => setLeads(branchLeads));
      // setShowEditDialog(false);
      // setSelectedLead(null);
      // setEditFormData({});

      onEditSuccess?.();
      close();
    } else {
      // Handle error if updateLead fails
      console.error("Failed to update lead");
    }
  };

  const handleLoanTypeChange = (loanType: string, checked: boolean) => {
    if (checked) {
      setEditFormData({
        ...editFormData,
        loanTypes: [...(editFormData.loanTypes || []), loanType],
      });
    } else {
      setEditFormData({
        ...editFormData,
        loanTypes: (editFormData.loanTypes || []).filter(
          (type) => type !== loanType
        ),
      });
    }
  };

  const handleDocuments = (document: ILoanDocument, checked: boolean) => {
    if (checked) {
      setEditFormData({
        ...editFormData,
        documents: [...(editFormData.documents || []), document],
      });
    } else {
      setEditFormData({
        ...editFormData,
        documents: (editFormData.documents || []).filter(
          (type) => type !== document
        ),
      });
    }
  };

  useEffect(() => {
    setEditFormData(lead || {});
  }, [lead]);

  useEffect(() => {
    // getBranches().then((branches) => {
    //   const currentBranch: Branch | undefined = branches.find(
    //     (b) => b.id === branchId
    //   );
    //   setBranch(currentBranch);
    // });
    getAllStaff().then((staffList) => setStaff(staffList));
  }, []);

  return (
    <>
      {open && lead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between cursor-pointer">
              <h3 className="text-lg font-semibold mb-4">Edit Lead Details</h3>
              <X onClick={close} />
            </div>
            {/* {user?.type !== "employee" && ( */}
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
                <div className="space-y-2">
                  <Label htmlFor="leadName">Lead Name *</Label>
                  <Input
                    id="leadName"
                    type="text"
                    placeholder="Enter lead name/reference"
                    value={editFormData.leadName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        leadName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leadSource">Source *</Label>

                  <select
                    id="leadSource"
                    value={editFormData.leadSource}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        leadSource: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    required
                  >
                    <option value="">Select lead source</option>
                    {LEAD_SOURCES.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                <div className="space-y-2">
                  <Label htmlFor="assignedStaff">Select staff member</Label>

                  <Select
                    value={editFormData.assignedStaff}
                    onValueChange={(value) => {
                      setEditFormData({
                        ...editFormData,
                        assignedStaff: value,
                      });
                    }}
                    disabled={user?.type == "employee" || user?.role == "staff"}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff
                        .filter(
                          (member) =>
                            member.type === "employee" &&
                            member.role === "staff"
                        )
                        .map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} - {member.designation}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerManagerAssignment">
                    Owner/Manager Assignment
                  </Label>

                  <Select
                    value={editFormData.ownerManagerAssignment}
                    onValueChange={(value) => {
                      setEditFormData({
                        ...editFormData,
                        ownerManagerAssignment: value,
                      });
                    }}
                    disabled={user?.type == "employee" || user?.role == "staff"}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select owner/manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff
                        .filter(
                          (member) =>
                            member.type === "official" &&
                            ["owner", "manager", "branch_head"].includes(
                              member.role
                            )
                        )
                        .map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} - {member.designation}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Client Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.clientName || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          clientName: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      value={editFormData.contactNumber || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          contactNumber: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="dateOfBirth"
                      className="text-sm font-medium text-gray-700"
                    >
                      Date of Birth
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={editFormData.dateOfBirth}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          dateOfBirth: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Gender
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={editFormData.gender}
                        onValueChange={(value) => {
                          setEditFormData({
                            ...editFormData,
                            gender: value as IGender,
                          });
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENDER_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cibilScore">CIBIL Score</Label>
                  <Input
                    id="cibilScore"
                    type="number"
                    placeholder="Enter CIBIL score"
                    value={editFormData.cibilScore}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        cibilScore: parseInt(e.target.value),
                      })
                    }
                    min="300"
                    max="900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editFormData.email || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          email: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Lead Type
                    </label>
                    <select
                      value={editFormData.leadType || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          leadType: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select lead type...</option>
                      <option value="Home Loan">Home Loan</option>
                      <option value="Personal Loan">Personal Loan</option>
                      <option value="Business Loan">Business Loan</option>
                      <option value="Car Loan">Car Loan</option>
                      <option value="Education Loan">Education Loan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Annual Income
                    </label>
                    <input
                      type="text"
                      value={editFormData.annualIncome || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          annualIncome: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Loan Amount
                    </label>
                    <input
                      type="text"
                      value={editFormData.loanAmount || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          loanAmount: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="permanentAddress"
                    className="text-sm font-medium text-gray-700"
                  >
                    Permanent Address
                  </Label>
                  <Textarea
                    id="permanentAddress"
                    value={editFormData.permanentAddress}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        permanentAddress: e.target.value,
                      })
                    }
                    placeholder="Enter permanent address"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Current Address
                  </label>
                  <textarea
                    value={editFormData.currentAddress || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        currentAddress: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md"
                    rows={3}
                  />
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">
                    Loan Type (Select one or more) *
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {LOAN_TYPES.map((loanType) => (
                      <div
                        key={loanType}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={loanType}
                          checked={(editFormData.loanTypes || []).includes(
                            loanType
                          )}
                          onChange={(e) =>
                            handleLoanTypeChange(loanType, e.target.checked)
                          }
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={loanType} className="text-sm">
                          {loanType}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">
                    3️⃣ Income Category *
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {INCOME_CATEGORY.map((category) => (
                      <div
                        key={category}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="radio"
                          id={category}
                          name="incomeCategory"
                          checked={editFormData.incomeCategory === category}
                          onChange={() =>
                            setEditFormData({
                              ...editFormData,
                              incomeCategory: category,
                            })
                          }
                          className="border-gray-300"
                        />
                        <Label htmlFor={category} className="text-sm">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {editFormData.incomeCategory && (
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      Employment Details
                    </h3>

                    {editFormData.incomeCategory === "Salaried" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Employer Name
                          </Label>
                          <Input
                            value={editFormData.employerName}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                employerName: e.target.value,
                              })
                            }
                            placeholder="Enter employer name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Designation
                          </Label>
                          <Input
                            value={editFormData.designation}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                designation: e.target.value,
                              })
                            }
                            placeholder="Enter designation"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Office Address
                          </Label>
                          <Textarea
                            value={editFormData.officeAddress}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                officeAddress: e.target.value,
                              })
                            }
                            placeholder="Enter office address"
                            rows={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Monthly Gross Salary
                          </Label>
                          <Input
                            value={editFormData.monthlyGrossSalary}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                monthlyGrossSalary: e.target.value,
                              })
                            }
                            placeholder="Enter monthly salary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Years of Experience
                          </Label>
                          <Input
                            value={editFormData.yearsOfExperience}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                yearsOfExperience: e.target.value,
                              })
                            }
                            placeholder="Enter years of experience"
                          />
                        </div>
                      </div>
                    )}

                    {(editFormData.incomeCategory === "Self-Employed" ||
                      editFormData.incomeCategory === "Business Owner") && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Business Name
                          </Label>
                          <Input
                            value={editFormData.businessName}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                businessName: e.target.value,
                              })
                            }
                            placeholder="Enter business name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Type of Business
                          </Label>
                          <Input
                            value={editFormData.businessType}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                businessType: e.target.value,
                              })
                            }
                            placeholder="Enter business type"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Business Address
                          </Label>
                          <Textarea
                            value={editFormData.businessAddress}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                businessAddress: e.target.value,
                              })
                            }
                            placeholder="Enter business address"
                            rows={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Annual Turnover
                          </Label>
                          <Input
                            value={editFormData.annualTurnover}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                annualTurnover: e.target.value,
                              })
                            }
                            placeholder="Enter annual turnover"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Years in Business
                          </Label>
                          <Input
                            value={editFormData.yearsInBusiness}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                yearsInBusiness: e.target.value,
                              })
                            }
                            placeholder="Enter years in business"
                          />
                        </div>
                      </div>
                    )}

                    {editFormData.incomeCategory === "NRI" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Country of Residence
                          </Label>
                          <Input
                            value={editFormData.countryOfResidence}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                countryOfResidence: e.target.value,
                              })
                            }
                            placeholder="Enter country of residence"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Job/Business Type
                          </Label>
                          <Input
                            value={editFormData.jobTypeNRI}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                jobTypeNRI: e.target.value,
                              })
                            }
                            placeholder="Enter job or business type"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Annual Income (Foreign Currency)
                          </Label>
                          <Input
                            value={editFormData.annualIncomeFC}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                annualIncomeFC: e.target.value,
                              })
                            }
                            placeholder="Enter annual income in foreign currency"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">
                    Loan Requirement Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Loan Amount Required
                      </Label>
                      <Input
                        value={editFormData.loanAmount}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            loanAmount: e.target.value,
                          })
                        }
                        placeholder="Enter loan amount"
                        type="number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Loan Tenure (Months)
                      </Label>
                      <Input
                        value={editFormData.loanTenure}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            loanTenure: parseFloat(e.target.value),
                          })
                        }
                        placeholder="Enter loan tenure in months"
                        type="number"
                      />
                    </div>
                    {/* TODO: <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Preferred Bank/NBFC
                                </Label>
                                <Select
                                  value={editFormData.}
                                  onValueChange={(value) =>
                                    setEditFormData({ ...editFormData, preferredBank: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select preferred bank" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {allBanks.map((bank) => (
                                      <SelectItem key={bank} value={bank}>
                                        {bank}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div> */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Urgency Level
                      </Label>
                      <Select
                        value={editFormData.urgencyLevel || ""}
                        onValueChange={(value) =>
                          setEditFormData({
                            ...editFormData,
                            urgencyLevel: value as IUrgencyLevel,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="within_1_month">
                            Within 1 Month
                          </SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Purpose of Loan
                      </Label>
                      <Textarea
                        value={editFormData.purposeOfLoan}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            purposeOfLoan: e.target.value,
                          })
                        }
                        placeholder="Enter purpose of loan"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Purpose
                  </label>
                  <input
                    type="text"
                    value={editFormData.purposeOfLoan || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        purposeOfLoan: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Notes
                  </label>
                  <textarea
                    value={editFormData.notes || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        notes: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md"
                    rows={3}
                  />
                </div>
              </div>
            </>
            {/* )} */}

            <Card className="my-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Bank & Branch Assignment
                </CardTitle>
                <CardDescription>
                  Assign to specific bank and upload bank-specific documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="selectedBank">Bank Selection</Label>

                    <select
                      id="selectedBank"
                      value={editFormData.bankSelection}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          bankSelection: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="">Select bank</option>
                      {BANKS.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankBranch">Bank Branch</Label>
                    <Input
                      id="bankBranch"
                      type="text"
                      placeholder="Enter bank branch name"
                      value={editFormData.bankBranch}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          bankBranch: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankStaff">Bank Staff Member</Label>
                    <Input
                      id="bankStaff"
                      type="text"
                      placeholder="Enter bank staff contact person"
                      value={editFormData.bankStaffMember}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          bankStaffMember: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="my-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">
                    Bank Assign Status
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {BANK_STATUS.map((status) => (
                      <div
                        key={status}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          editFormData.bankStatus === status
                            ? "border-primary bg-primary/10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() =>
                          setEditFormData({
                            ...editFormData,
                            bankStatus: status,
                          })
                        }
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${getBankStatusColor(
                              status
                            )}`}
                          ></div>
                          <span className="font-medium capitalize">
                            {status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Documents
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {LOAN_DOCUMENTS.map((document) => (
                  <div key={document} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={document}
                      name="document"
                      checked={(editFormData.documents || []).includes(
                        document
                      )}
                      onChange={(e) =>
                        handleDocuments(document, e.target.checked)
                      }
                      className="border-gray-300"
                    />
                    <Label htmlFor={document} className="text-sm">
                      {document}
                    </Label>
                  </div>
                ))}
              </div>

              <div className="my-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Document Collection Status
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {DOCUMENT_STATUS.map((status) => (
                    <div
                      key={status}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        editFormData.documentStatus === status
                          ? "border-primary bg-primary/10"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() =>
                        setEditFormData({
                          ...editFormData,
                          documentStatus: status,
                        })
                      }
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${getDocumentStatusColor(
                            status
                          )}`}
                        ></div>
                        <span className="font-medium capitalize">{status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Card className="my-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Application Status Flow
                </CardTitle>
                <CardDescription>
                  Set initial application status with color coding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {APPLICATION_STATUS.map((status) => (
                    <div
                      key={status}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        editFormData.applicationStatus === status
                          ? "border-primary bg-primary/10"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() =>
                        setEditFormData({
                          ...editFormData,
                          applicationStatus: status,
                        })
                      }
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${getStatusColor(
                            status
                          )}`}
                        ></div>
                        <span className="font-medium">{status}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks">Status Remarks/Notes</Label>
                  <Textarea
                    id="remarks"
                    placeholder="Add remarks about the current status..."
                    value={editFormData.statusRemarks}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        statusRemarks: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">Estimated Cost</Label>
                  <Input
                    id="cost"
                    type="number"
                    placeholder="Enter estimated cost"
                    value={editFormData.estimatedCost}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        estimatedCost: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    placeholder="Enter any additional information about the lead"
                    value={editFormData.additionalInformation}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        additionalInformation: e.target.value,
                      })
                    }
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleEditLead}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  close();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditLeadDialog;
