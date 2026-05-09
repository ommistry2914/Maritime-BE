# PDF Export

The business-flow documentation is maintained in `BUSINESS_FLOW.md`.

To export it as a PDF on a machine with Pandoc installed:

```bash
pandoc docs/BUSINESS_FLOW.md -o docs/BUSINESS_FLOW.pdf
```

Alternative browser flow:

1. Open `docs/BUSINESS_FLOW.md` in VS Code preview.
2. Use print/export from the preview or browser.
3. Save as `docs/BUSINESS_FLOW.pdf`.

The repository keeps the markdown source as the canonical document so it can be reviewed and versioned cleanly.
