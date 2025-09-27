import { useAuth } from "@/hooks/use-auth";
import { updateLead } from "@/services/lead-service";
import { IGender, IUrgencyLevel, LeadForm } from "@/types/common";
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
import { GENDER_OPTIONS, INCOME_CATEGORY, LOAN_TYPES } from "@/lib/consts";
import { Textarea } from "./ui/textarea";

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

  const handleEditLead = async () => {
    if (!lead || !user) return;

    const updatedLead: LeadForm = {
      ...lead,
      ...editFormData,

      statusUpdatedAt: new Date().toISOString(), // Update statusUpdatedAt on any edit
    };

    const success = await updateLead(updatedLead.id!, updatedLead);
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

  useEffect(() => {
    setEditFormData(lead || {});
  }, [lead]);

  return (
    <>
      {open && lead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Lead Details</h3>
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
                    type="text"
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
                    <div key={loanType} className="flex items-center space-x-2">
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
                    <div key={category} className="flex items-center space-x-2">
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
                      value={editFormData.urgencyLevel}
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
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={editFormData.notes || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, notes: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>
            </div>

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
