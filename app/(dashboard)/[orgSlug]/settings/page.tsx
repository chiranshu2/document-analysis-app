"use client";

import { useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { organization } = useOrganization();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteOrganization = async () => {
    if (!organization) return;

    setIsDeleting(true);
    try {
      // Delete organization from database
      const dbResponse = await fetch(`/api/organizations/${organization.id}`, {
        method: "DELETE",
      });

      if (!dbResponse.ok) {
        throw new Error("Failed to delete organization from database");
      }

      // Delete organization from Clerk
      await organization.destroy();

      toast.success("Organization deleted successfully");
      router.push("/select-org");
    } catch (error: any) {
      console.error("Failed to delete organization:", error);
      toast.error(error.message || "Failed to delete organization");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (!organization) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage your organization settings</p>
      </div>

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Info</CardTitle>
          <CardDescription>Basic information about your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Organization Name</label>
            <p className="text-lg font-semibold">{organization.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Organization Slug</label>
            <p className="text-lg font-semibold">{organization.slug}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Organization ID</label>
            <p className="text-sm text-gray-500 font-mono">{organization.id}</p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-red-600 mb-2">Delete Organization</h3>
              <p className="text-sm text-gray-600 mb-4">
                Permanently delete this organization and all its data. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Organization
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organization?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{organization.name}</strong>? This action cannot be undone. All documents and team members will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-sm text-red-700">
              <strong>Warning:</strong> This will delete all associated data.
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrganization}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
