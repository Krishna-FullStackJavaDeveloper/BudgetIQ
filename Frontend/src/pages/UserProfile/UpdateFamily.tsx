import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Button,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { useLocation } from "react-router-dom";
import { useNotification } from "../../components/common/NotificationProvider";
import { getFamilyById, getMyFamily, updateFamily } from "../../api/family";

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const UpdateFamily = () => {
  const [familyData, setFamilyData] = useState<any | null>(null);
  const [editedDetails, setEditedDetails] = useState<any | null>(null);
  const { showNotification } = useNotification();
  const userId = localStorage.getItem("userId");
  const userRoles = JSON.parse(localStorage.getItem("roles") || "[]");
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(location.state?.editMode || false);
  const fetchedOnce = useRef(false);

  const fetchFamily = async () => {
    try {
      let data;
      if (userRoles.includes("ROLE_ADMIN")) {
         // 👇 Fetch familyId from localStorage
      const familyId = localStorage.getItem("selectedFamilyId");
      if (!familyId) return console.error("No familyId found");

      const response = await getFamilyById(Number(familyId));
      data = response.data;
      } else {
        const response = await getMyFamily();
        data = response.data;
      }
      setFamilyData(data);
      setEditedDetails(data); // Initialize editable copy
    } catch (error) {
      console.error("Failed to fetch family data", error);
    }
  };

  const handleSave = async () => {
  if (!editedDetails?.familyName) {
    showNotification("Family Name is required", "warning");
    return;
  }

  const payload: { familyName: string; passkey?: string } = {
    familyName: editedDetails.familyName.trim(),
  };

  // Only include passkey if it's provided (i.e., user wants to change it)
  if (editedDetails.passkey && editedDetails.passkey.trim() !== "") {
    payload.passkey = editedDetails.passkey.trim();
  }

  try {
    await updateFamily(familyData.id, payload);
    showNotification("Family updated successfully", "success");
    setFamilyData({ ...familyData, ...payload });
    setIsEditing(false);
  } catch (error) {
    showNotification("Failed to update family", "error");
    console.error("Error updating family:", error);
  }
};



  useEffect(() => {
    if (!fetchedOnce.current) {
      fetchFamily();
      fetchedOnce.current = true;
    }
  }, []);

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setEditedDetails(familyData);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedDetails((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!familyData) {
    return <Typography>No family data found</Typography>;
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 6 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4, mt: 4 }}>
          {isEditing ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon sx={{ mb: 1.4 }} />}
              sx={{ padding: "1px 12px", borderRadius: "10px" }}
               onClick={handleSave}
            >
              Save
            </Button>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleEdit}
              startIcon={<EditIcon sx={{ mb: 1.4 }} />}
              sx={{ padding: "1px 12px", borderRadius: "10px" }}
            >
              Edit
            </Button>
          )}
        </Box>

        <Card sx={{ width: "100%", maxWidth: 600, boxShadow: 5, borderRadius: 3 }}>
          <CardContent>
            <Stack alignItems="center" spacing={2}>
              <Typography variant="h5" fontWeight={600}>
                {familyData?.moderatorUsername}
              </Typography>
            </Stack>

            <Grid container spacing={2} mt={2}>
              {/* Editable fields */}
              {["familyName", "passkey"].map((field) => (
                <Grid item xs={12} key={field}>
                  <TextField
                    fullWidth
                    name={field}
                    label={field
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                    value={
                      isEditing ? editedDetails?.[field] : familyData?.[field]
                    }
                    onChange={handleChange}
                    disabled={!isEditing}
                    variant="outlined"
                  />
                </Grid>
              ))}

              {/* Non-editable fields */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="createdAt"
                  label="Created At"
                  value={formatDate(familyData.createdAt)}
                  disabled
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="userSize"
                  label="User Size"
                  value={familyData.userSize}
                  disabled
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {isEditing && (
          <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 4 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleCancel}
              sx={{ padding: "1px 12px", borderRadius: "10px" }}
            >
              Cancel
            </Button>
          </Box>
        )}
      </Box>
    </>
  );
};

export default UpdateFamily;
