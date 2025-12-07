"use client";

import { useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Box,
  Typography,
  CircularProgress
} from "@mui/material";

interface ValidationResult {
  fields: Array<{
    field: string;
    provided: unknown;
    expected: unknown;
    status: string;
    comment: string;
  }>;
  calculated?: any;         
}

export default function DesignValidatorPage() {
  const emptyForm: { [key: string]: string } = {
    standard: "",
    voltage: "",
    conductorMaterial: "",
    conductorClass: "",
    csa: "",
    insulationMaterial: "",
    insulationThickness: "",
    sheathThickness: "",
    outerDiameter: "",  
    freeText: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const normalize = (v: string) =>
    v.trim() === "" ? undefined : v;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/design/validate", {
        standard: normalize(form.standard),
        voltage: normalize(form.voltage),
        conductorMaterial: normalize(form.conductorMaterial),
        conductorClass: normalize(form.conductorClass),

        csa: form.csa.trim() === "" ? undefined : Number(form.csa),
        insulationMaterial: normalize(form.insulationMaterial),
        insulationThickness:
          form.insulationThickness.trim() === ""
            ? undefined
            : Number(form.insulationThickness),
        sheathThickness:
          form.sheathThickness.trim() === ""
            ? undefined
            : Number(form.sheathThickness),
        outerDiameter:
          form.outerDiameter.trim() === ""
            ? undefined
            : Number(form.outerDiameter), 

        freeText: form.freeText,
      });

      setResult(response.data);
    } catch (error) {
      console.error("Validation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setForm(emptyForm);
    setResult(null);
  };

  return (
    <Box sx={{ p: 4, background: "white", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Cable Design Validator
      </Typography>

      {/* Input Fields */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 2,
        }}
      >
        {[
          "standard",
          "voltage",
          "conductorMaterial",
          "conductorClass",
          "csa",
          "insulationMaterial",
          "insulationThickness",
          "sheathThickness",
          "outerDiameter", 
        ].map((field) => (
          <TextField
            key={field}
            label={field}
            name={field}
            variant="outlined"
            value={form[field]}
            onChange={handleChange}
            fullWidth
          />
        ))}

        <TextField
          label="Free Text Input"
          name="freeText"
          multiline
          rows={3}
          sx={{ gridColumn: "span 2" }}
          value={form.freeText}
          onChange={handleChange}
          fullWidth
        />
      </Box>

      {/* Buttons */}
      <Box sx={{ mt: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? "Validating..." : "Validate"}
        </Button>

        <Button variant="outlined" color="secondary" onClick={handleClear} disabled={loading}>
          Clear
        </Button>

        {loading && <CircularProgress size={28} />}
      </Box>

      {/* Results */}
      {result && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Validation Results
          </Typography>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Field</TableCell>
                <TableCell>Provided</TableCell>
                <TableCell>Expected</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Comment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.fields.map((f, i) => (
                <TableRow key={i}>
                  <TableCell>{f.field}</TableCell>
                  <TableCell>{JSON.stringify(f.provided)}</TableCell>
                  <TableCell>{JSON.stringify(f.expected)}</TableCell>
                  <TableCell>
                    <Chip
                      label={f.status}
                      color={
                        f.status === "PASS"
                          ? "success"
                          : f.status === "WARN"
                          ? "warning"
                          : "error"
                      }
                    />
                  </TableCell>
                  <TableCell>{f.comment}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* NEW: ENGINEERING CALCULATIONS */}
          {result.calculated && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6">Engineering Calculations</Typography>

              <pre
                style={{
                  background: "#f5f5f5",
                  padding: "15px",
                  borderRadius: "8px",
                  marginTop: "10px",
                  overflowX: "auto",
                }}
              >
                {JSON.stringify(result.calculated, null, 2)}
              </pre>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
