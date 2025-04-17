import React, { useState } from "react";
import {
  Box,
  TextField,
  Grid,
  Typography,
  Button,
  Paper,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Autocomplete,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  TableSortLabel,
} from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const AddCategory = () => {
  const [categoryName, setCategoryName] = useState("");
  const [iconSearch, setIconSearch] = useState("");
  const [selectedIconName, setSelectedIconName] = useState("");
  const [color, setColor] = useState("#1976d2");
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null); // Track the index of the category being edited

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Sorting state
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string>("name");

  const iconNames = Object.keys(MuiIcons) as (keyof typeof MuiIcons)[];
  const filteredIcons =
    iconSearch.length > 0
      ? iconNames.filter((name) =>
          name.toLowerCase().includes(iconSearch.toLowerCase())
        )
      : [];

  const handleAddCategory = () => {
    if (!categoryName || !selectedIconName) return;

    setIsLoading(true);

    // Simulate an async operation (like API call)
    setTimeout(() => {
      const newCategory = { name: categoryName, iconName: selectedIconName, color };

      if (editIndex !== null) {
        // Update category if editing an existing one
        const updatedCategoryList = [...categoryList];
        updatedCategoryList[editIndex] = newCategory;
        setCategoryList(updatedCategoryList);
        console.log("Updated category list (edit):", updatedCategoryList);
        setDialogMessage("Category updated successfully!");
      } else {
        // Add new category if not editing
        const updatedCategoryList = [...categoryList, newCategory];
        setCategoryList(updatedCategoryList);
        console.log("Updated category list (add):", updatedCategoryList);
        setDialogMessage("Category added successfully!");
      }

      setIsLoading(false);
      setOpenModal(true);

      // Reset form fields and edit state
      setCategoryName("");
      setIconSearch("");
      setSelectedIconName("");
      setColor("#1976d2");
      setEditIndex(null); // Clear the edit state
    }, 1000); // Simulated delay
  };

  const handleDelete = (index: number) => {
    const updated = [...categoryList];
    updated.splice(index, 1);
    setCategoryList(updated);
  };

  const handleEdit = (index: number) => {
    const cat = categoryList[index];
    setCategoryName(cat.name);
    setSelectedIconName(cat.iconName);
    setIconSearch(cat.iconName);
    setColor(cat.color);
    setEditIndex(index); // Set the edit index
  };

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset page to 0 when rows per page changes
  };

  const IconComponent = MuiIcons[selectedIconName as keyof typeof MuiIcons];

  // Sort the data based on the current order and column
  const sortedData = [...categoryList].sort((a, b) => {
    if (orderBy === "name") {
      return order === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    return 0;
  });

  // Calculate the data to display on the current page
  const currentData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box p={4}>
      <Typography variant="h5" mb={2}>
        {editIndex !== null ? "Edit Category" : "Add Category"}
      </Typography>

      <Grid container spacing={2}>
        {/* Category Name */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Category Name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </Grid>

        {/* Icon Search */}
        <Grid item xs={12} md={4} sx={{ position: "relative" }}>
          <Autocomplete
            freeSolo
            options={filteredIcons}
            inputValue={iconSearch}
            onInputChange={(event, newInputValue) => setIconSearch(newInputValue)}
            onChange={(event, newValue) => {
              setSelectedIconName(newValue || "");
            }}
            renderOption={(props, option) => {
              const Icon = MuiIcons[option as keyof typeof MuiIcons];
              return (
                <li {...props} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {Icon && <Icon fontSize="small" />}
                  <span>{option}</span>
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Icon"
                fullWidth
                placeholder="e.g. Home, Brush"
              />
            )}
          />
          {selectedIconName && (
            <Box mt={1}>
              <Typography variant="body2">Selected Icon:</Typography>
              {React.createElement(
                MuiIcons[selectedIconName as keyof typeof MuiIcons],
                {
                  sx: { fontSize: 32, color },
                }
              )}
            </Box>
          )}
        </Grid>

        {/* Color Picker */}
        <Grid item xs={12} md={2}>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{
              width: "100%",
              height: "56px",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          />
        </Grid>

        {/* Add/Update Button */}
        <Grid item xs={12} md={2}>
          <Button variant="contained" fullWidth onClick={handleAddCategory}>
            {isLoading ? "Updating..." : editIndex !== null ? "Update" : "Add"}
          </Button>
        </Grid>
      </Grid>

      {/* Category List */}
      <Box mt={4}>
        <Typography variant="h6">Category List</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Icon</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "name"}
                  direction={orderBy === "name" ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, "name")}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>Color</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentData.map((cat, idx) => {
              const Icon = MuiIcons[cat.iconName as keyof typeof MuiIcons];
              return (
                <TableRow key={idx}>
                  <TableCell>
                    {Icon && <Icon sx={{ color: cat.color, fontSize: 28 }} />}
                  </TableCell>
                  <TableCell>{cat.name}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        bgcolor: cat.color,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleEdit(idx)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(idx)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Table Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={categoryList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>

      {/* Dialog Box for confirmation */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Category {dialogMessage.includes('added') ? 'Added' : 'Updated'}</DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Overlay */}
      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(255,255,255,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1300,
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default AddCategory;
