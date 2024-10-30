import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

const ConfirmationDialog = ({ open, onClose, onConfirm, message }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="backdrop-blur-sm bg-gray-900 bg-opacity-50 flex items-center justify-center"
      maxWidth="sm"
      fullWidth
    >
      <div className="p-6 rounded-lg shadow-lg">
        <DialogTitle className="text-xl font-semibold text-gray-800">{message}</DialogTitle>
        <DialogContent>
          <p className="text-gray-700">Are you sure you want to proceed?</p>
        </DialogContent>
        <DialogActions className="flex justify-end space-x-4 p-4">
          <Button
            onClick={onClose}
            className="bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors px-4 py-2"
          >
            Confirm
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
};

export default ConfirmationDialog;
