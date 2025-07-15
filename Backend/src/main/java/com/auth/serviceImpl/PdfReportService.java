package com.auth.serviceImpl;

import com.auth.entity.User;
import com.auth.report.ExpenseDto;
import com.auth.report.FinancialReportDto;
import com.auth.report.IncomeDto;
import com.auth.report.MonthlySummaryDto;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.Color;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.*;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.jfree.chart.labels.ItemLabelAnchor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

import com.itextpdf.kernel.events.IEventHandler;
import com.itextpdf.kernel.events.PdfDocumentEvent;
import com.itextpdf.kernel.events.Event;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.layout.Canvas;

import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.plot.CategoryPlot;
import org.jfree.chart.renderer.category.BarRenderer;
import org.jfree.data.category.DefaultCategoryDataset;
import org.jfree.chart.title.LegendTitle;
import java.awt.image.BufferedImage;
import java.awt.Font;

import org.jfree.chart.labels.StandardCategoryItemLabelGenerator;
import org.jfree.chart.labels.ItemLabelPosition;
import org.jfree.chart.ui.TextAnchor;
import org.jfree.chart.ui.RectangleInsets;

@Service
public class PdfReportService {
    private static final DateTimeFormatter DISPLAY_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public byte[] generateFinancialReportPdf(FinancialReportDto report, ZoneId userZoneId) throws IOException {

        String symbol = getCurrencySymbolFromZone(userZoneId); // You’ll need to pass the user or currencyCode
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);

//        PdfFont font = PdfFontFactory.createFont(StandardFonts.HELVETICA);
//        PdfFont fontBold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);

        PdfFont font;
        PdfFont fontBold;

        try (InputStream fontStream = getClass().getClassLoader().getResourceAsStream("fonts/NotoSans-Regular.ttf");
             InputStream fontBoldStream = getClass().getClassLoader().getResourceAsStream("fonts/NotoSans-Bold.ttf")) {

            if (fontStream == null) throw new RuntimeException("fonts/NotoSans-Regular.ttf not found");
            if (fontBoldStream == null) {
                throw new RuntimeException("Font not found in resources: fonts/NotoSans-Bold.ttf");
            }

            font = PdfFontFactory.createFont(fontStream.readAllBytes(), PdfEncodings.IDENTITY_H, PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED);
            fontBold = PdfFontFactory.createFont(fontBoldStream.readAllBytes(), PdfEncodings.IDENTITY_H, PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED);
        }

        // ✅ Register the footer event handler
        pdf.addEventHandler(PdfDocumentEvent.END_PAGE, new FooterHandler(font));
        Document document = new Document(pdf);

        // ---------- Title ----------
        Table titleTable = new Table(UnitValue.createPercentArray(new float[]{1})).useAllAvailableWidth();
        Cell centerCell = new Cell().add(new Paragraph("BudgetIQ- Financial Report")).setFont(fontBold).setFontColor(new DeviceRgb(13, 71, 161)).setFontSize(18).setTextAlignment(TextAlignment.CENTER).setBorder(null);
        titleTable.addCell(centerCell);
        document.add(titleTable);
        document.add(new Paragraph("\n"));

        // ---------- Subtitle ----------
        Table subTitleTable = new Table(UnitValue.createPercentArray(new float[]{3, 3})).useAllAvailableWidth();
        // Left Cell: "For: [startDateStr] to [endDateStr]"
        Paragraph leftParagraph = new Paragraph().add(new Text("For: ").setFont(fontBold).setFontColor(new DeviceRgb(13, 71, 161))).add(new Text(report.getStartDateStr()).setFont(font).setFontColor(new DeviceRgb(69, 90, 100))).add(new Text(" to ").setFont(fontBold)).add(new Text(report.getEndDateStr()).setFont(font).setFontColor(new DeviceRgb(69, 90, 100)));
        Cell leftCell = new Cell().add(leftParagraph).setTextAlignment(TextAlignment.LEFT).setBorder(null);

        // Right Cell: "Generated for: [userFullName]"
        Paragraph rightParagraph = new Paragraph().add(new Text("Generated for: ").setFont(fontBold).setFontColor(new DeviceRgb(13, 71, 161))).add(new Text(report.getUserFullName()).setFont(font).setFontColor(new DeviceRgb(69, 90, 100)));
        Cell rightCell = new Cell().add(rightParagraph).setTextAlignment(TextAlignment.RIGHT).setBorder(null);
        subTitleTable.addCell(leftCell);
        subTitleTable.addCell(rightCell);
        document.add(subTitleTable);
        document.add(new Paragraph("\n"));

        // ---------- Summary Section ----------
        Table summaryTable = new Table(UnitValue.createPercentArray(new float[]{5, 5, 5})).useAllAvailableWidth();

        summaryTable.addCell(createSummaryCell("Total Income:", report.getTotalIncome(), fontBold, new DeviceRgb(0, 77, 64), new DeviceRgb(38, 166, 154), symbol));
        summaryTable.addCell(createSummaryCell("Total Expense:", report.getTotalExpense(), fontBold, new DeviceRgb(183, 28, 28), new DeviceRgb(229, 115, 115), symbol));
        summaryTable.addCell(createSummaryCell("Net Balance:", report.getTotalIncome().subtract(report.getTotalExpense()), fontBold, new DeviceRgb(230, 81, 0), new DeviceRgb(251, 140, 0), symbol));
        document.add(summaryTable);
        document.add(new Paragraph("\n"));

        // ---------- Expenses Table ----------
        document.add(new Paragraph("Expenses").setFont(fontBold).setFontSize(14));
        // Define the table with column widths
        Table expenseTable = new Table(UnitValue.createPercentArray(new float[]{3, 4, 3})).useAllAvailableWidth();
        // Header cells with background color
        DeviceRgb headerColor = new DeviceRgb(77, 208, 225);
        expenseTable.addHeaderCell(createColoredHeaderCell("Date", fontBold, headerColor));
        expenseTable.addHeaderCell(createColoredHeaderCell("Category", fontBold, headerColor));
        expenseTable.addHeaderCell(createColoredHeaderCell("Amount", fontBold, headerColor));

        // Sort expenses by date
        List<ExpenseDto> expenses = report.getExpenses().stream().sorted(Comparator.comparing(ExpenseDto::getDate)).toList();
        BigDecimal totalExpense = BigDecimal.ZERO;

        // Add expense rows
        for (ExpenseDto expense : expenses) {
            expenseTable.addCell(createDateCell(expense.getDate(), font, userZoneId));
            expenseTable.addCell(new Cell().add(new Paragraph(expense.getCategory()).setFont(font)).setTextAlignment(TextAlignment.CENTER));
            expenseTable.addCell(createAmountCell(expense.getAmount(), font, new DeviceRgb(183, 28, 28), symbol));

            totalExpense = totalExpense.add(expense.getAmount());
        }
        // Add total row after table
        Cell totalLabel = new Cell(1, 2).add(new Paragraph("Total Expense").setFont(fontBold)).setTextAlignment(TextAlignment.RIGHT).setBorderTop(new SolidBorder(1));

        Cell totalAmount = new Cell().add(new Paragraph(symbol + String.format("%,.2f", totalExpense)).setFont(fontBold).setFontColor(new DeviceRgb(183, 28, 28))).setTextAlignment(TextAlignment.RIGHT).setBorderTop(new SolidBorder(1));

        expenseTable.addCell(totalLabel);
        expenseTable.addCell(totalAmount);
        // Add the table to document
        document.add(expenseTable);

        // ---------- Page Break ----------
        document.add(new com.itextpdf.layout.element.AreaBreak());

        // ---------- Page 2 Header ----------
        Table page2Header = new Table(UnitValue.createPercentArray(new float[]{4, 4})).useAllAvailableWidth();

        Cell leftPage2 = new Cell().add(new Paragraph(report.getUserFullName())).setFont(font).setFontColor(new DeviceRgb(38, 50, 56)).setTextAlignment(TextAlignment.LEFT).setBorder(null);

        Cell rightPage2 = new Cell().add(new Paragraph().add(new Text(report.getStartDateStr()).setFont(font).setFontColor(new DeviceRgb(69, 90, 100))).add(new Text(" to ").setFont(fontBold)).add(new Text(report.getEndDateStr()).setFont(font).setFontColor(new DeviceRgb(69, 90, 100)))).setFont(font).setTextAlignment(TextAlignment.RIGHT).setBorder(null);

        page2Header.addCell(leftPage2);
        page2Header.addCell(rightPage2);

        document.add(page2Header);
        document.add(new Paragraph("\n"));

        // ---------- Income Table ----------
        document.add(new Paragraph("Income").setFont(fontBold).setFontSize(14));

        Table incomeTable = new Table(UnitValue.createPercentArray(new float[]{3, 4, 3})).useAllAvailableWidth();

        // Header with same style as expense table
        DeviceRgb incomeHeaderColor = new DeviceRgb(77, 208, 225);
        incomeTable.addHeaderCell(createColoredHeaderCell("Date", fontBold, incomeHeaderColor));
        incomeTable.addHeaderCell(createColoredHeaderCell("Source", fontBold, incomeHeaderColor));
        incomeTable.addHeaderCell(createColoredHeaderCell("Amount", fontBold, incomeHeaderColor));

        // Sort incomes by date if needed (optional)
        List<IncomeDto> incomes = report.getIncomes();
        BigDecimal totalIncome = BigDecimal.ZERO;

        for (IncomeDto income : incomes) {
            incomeTable.addCell(createDateCell(income.getDate(), font, userZoneId));

            // Center align Source
            incomeTable.addCell(new Cell().add(new Paragraph(income.getSource()).setFont(font)).setTextAlignment(TextAlignment.CENTER));

            // Amount column with green tone
            incomeTable.addCell(createAmountCell(income.getAmount(), font, new DeviceRgb(27, 94, 32), symbol));

            totalIncome = totalIncome.add(income.getAmount());
        }

        // Total row
        Cell totalIncomeLabel = new Cell(1, 2).add(new Paragraph("Total Income").setFont(fontBold)).setTextAlignment(TextAlignment.RIGHT).setBorderTop(new SolidBorder(1));

        Cell totalIncomeAmount = new Cell().add(new Paragraph(symbol + String.format("%,.2f", totalIncome)).setFont(fontBold).setFontColor(new DeviceRgb(27, 94, 32))).setTextAlignment(TextAlignment.RIGHT).setBorderTop(new SolidBorder(1));

        incomeTable.addCell(totalIncomeLabel);
        incomeTable.addCell(totalIncomeAmount);

        // Add table to document
        document.add(incomeTable);

        // Page break
        document.add(new com.itextpdf.layout.element.AreaBreak());
//--------Page 3------------
// Title
        Table page3Header = new Table(UnitValue.createPercentArray(new float[]{4, 4})).useAllAvailableWidth();

        Cell leftPage3 = new Cell().add(new Paragraph(report.getUserFullName())).setFont(font).setFontColor(new DeviceRgb(38, 50, 56)).setTextAlignment(TextAlignment.LEFT).setBorder(null);

        Cell rightPage3 = new Cell().add(new Paragraph().add(new Text(report.getStartDateStr()).setFont(font).setFontColor(new DeviceRgb(69, 90, 100))).add(new Text(" to ").setFont(fontBold)).add(new Text(report.getEndDateStr()).setFont(font).setFontColor(new DeviceRgb(69, 90, 100)))).setFont(font).setTextAlignment(TextAlignment.RIGHT).setBorder(null);

        page3Header.addCell(leftPage3);
        page3Header.addCell(rightPage3);

        document.add(page3Header);
        document.add(new Paragraph("\n"));

        document.add(new Paragraph("Monthly Financial Overview").setFont(fontBold).setFontSize(14).setTextAlignment(TextAlignment.CENTER));

        DefaultCategoryDataset dataset = new DefaultCategoryDataset();
        for (MonthlySummaryDto monthData : report.getMonthlyBreakdown()) {
            String month = monthData.getMonthLabel();
            dataset.addValue(monthData.getTotalIncome(), "Income", month);
            dataset.addValue(monthData.getTotalExpense(), "Expense", month);
            dataset.addValue(monthData.getNetBalance(), "Net Balance", month);
        }

        JFreeChart chart = ChartFactory.createBarChart("", // No title inside chart
                "Month", "Amount", dataset);

        // Customize legend font
        LegendTitle legend = chart.getLegend();
        if (legend != null) {
            legend.setItemFont(new Font("Arial", Font.BOLD, 16));  // bold and bigger font
        }

        CategoryPlot plot = chart.getCategoryPlot();
        BarRenderer renderer = (BarRenderer) plot.getRenderer();

        // Change X-axis (domain axis) label font
        plot.getDomainAxis().setLabelFont(new Font("Arial", Font.BOLD, 16)); // Axis label (e.g., "Month")
        plot.getDomainAxis().setTickLabelFont(new Font("Arial", Font.BOLD, 14)); // Tick labels (e.g., Jan 2024, Feb 2024, etc.)

        // Change Y-axis (range axis) label font
        plot.getRangeAxis().setLabelFont(new Font("Arial", Font.BOLD, 16)); // Axis label (e.g., "Amount")
        plot.getRangeAxis().setTickLabelFont(new Font("Arial", Font.BOLD, 14)); // Tick labels (e.g., 0, 100, 200)

        // Add padding around plot area to prevent clipping
        plot.setInsets(new RectangleInsets(30.0, 10.0, 30.0, 10.0)); // top, left, bottom, right

        // Set custom bar colors
        renderer.setSeriesPaint(0, new java.awt.Color(38, 166, 154)); // Income
        renderer.setSeriesPaint(1, new java.awt.Color(229, 115, 115)); // Expense
        renderer.setSeriesPaint(2, new java.awt.Color(251, 140, 0));   // Balance

        // Enable value labels
        renderer.setDefaultItemLabelsVisible(true);

        //  Label generator with currency symbol
        renderer.setDefaultItemLabelGenerator(new StandardCategoryItemLabelGenerator("{2}", new java.text.DecimalFormat(symbol + "#,##0.00")));
        // Set label font (you can change name, style, size)
        renderer.setDefaultItemLabelFont(new java.awt.Font("Arial", Font.BOLD, 14));

        // Set label color (optional)
        renderer.setDefaultItemLabelPaint(java.awt.Color.DARK_GRAY);

        // Optional: Label position on top of bars (requires jfreechart-ui lib)
        renderer.setDefaultPositiveItemLabelPosition(new ItemLabelPosition(ItemLabelAnchor.OUTSIDE12, // label above bar
                TextAnchor.BOTTOM_CENTER // text aligned at bottom center
        ));

        BufferedImage chartImage = chart.createBufferedImage(900, 700);
        ImageData imageData = ImageDataFactory.create(chartImage, null);
        document.add(new Image(imageData).setAutoScale(true));


        document.close();

        return baos.toByteArray();
    }

    // Helpers

    private Cell createSummaryCell(String label, BigDecimal amount, PdfFont font, com.itextpdf.kernel.colors.Color labelColor, com.itextpdf.kernel.colors.Color valueColor, String currencySymbol) {
        Paragraph p = new Paragraph().add(new Text(label).setFont(font).setFontColor(labelColor)).add(new Text(" " + formatMoney(amount, currencySymbol)).setFont(font).setFontColor(valueColor));

        return new Cell().add(p).setBorder(null);
    }

    private Cell createHeaderCell(String text, PdfFont font) {
        return new Cell().add(new Paragraph(text).setFont(font).setFontSize(12)).setBackgroundColor(ColorConstants.LIGHT_GRAY).setTextAlignment(TextAlignment.CENTER);
    }

    private Cell createDateCell(Instant dateInstant, PdfFont font, ZoneId zone) {
        String dateStr = dateInstant.atZone(zone).format(DISPLAY_DATE_FORMAT);
        return new Cell().add(new Paragraph(dateStr).setFont(font)).setTextAlignment(TextAlignment.CENTER);
    }

    private Cell createAmountCell(BigDecimal amount, PdfFont font, Color color, String symbol) {
        String formatted = formatMoney(amount, symbol);
        return new Cell().add(new Paragraph(formatted).setFont(font).setFontColor(color)).setTextAlignment(TextAlignment.RIGHT);
    }

    private Cell createColoredHeaderCell(String text, PdfFont font, com.itextpdf.kernel.colors.Color bgColor) {
        return new Cell().add(new Paragraph(text).setFont(font).setFontSize(12)).setBackgroundColor(bgColor).setTextAlignment(TextAlignment.CENTER);
    }

    private String formatMoney(BigDecimal amount, String symbol) {
        if (amount == null) return symbol + "0.00";
        return symbol + String.format("%,.2f", amount);
    }

    private String getCurrencySymbolFromZone(ZoneId zoneId) {
        if (zoneId == null) return "$"; // fallback

        return switch (zoneId.getId()) {
            // North America
            case "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Toronto",
                 "America/Vancouver" -> "$"; // USD and CAD
            case "America/Mexico_City" -> "Mex$";

            // South America
            case "America/Sao_Paulo" -> "R$"; // Brazil

            // Europe - Euro zone extended
            case "Europe/Paris", "Europe/Berlin", "Europe/Rome", "Europe/Madrid", "Europe/Amsterdam", "Europe/Brussels",
                 "Europe/Stockholm", "Europe/Zurich", "Europe/Lisbon", "Europe/Andorra", "Europe/Malta",
                 "Europe/Luxembourg", "Europe/Monaco", "Europe/Podgorica", "Europe/Sarajevo", "Europe/Skopje",
                 "Europe/Tirane", "Europe/Vatican", "Europe/San_Marino", "Europe/Belgrade", "Europe/Bratislava",
                 "Europe/Dublin", "Europe/Ljubljana", "Europe/Riga",
                 "Europe/Valletta", "Europe/Mariehamn", "Europe/Simferopol", "Europe/Uzhgorod", "Europe/Zaporozhye",
                 "Africa/Ceuta" // Spanish exclave in Africa
                    -> "€";

            case "Europe/London", "Europe/Isle_of_Man", "Europe/Gibraltar", "Europe/Guernsey", "Europe/Jersey",
                 "Atlantic/Canary", "Atlantic/Madeira" -> "£";

            case "Europe/Oslo", "Europe/Copenhagen", "Europe/Faroe", "Europe/Svalbard_and_Jan_Mayen",
                 "Europe/Reykjavik" -> "kr";

            case "Europe/Warsaw" -> "zł";

            case "Europe/Moscow", "Europe/Kaliningrad", "Europe/Samara", "Europe/Volgograd" -> "₽";

            case "Europe/Budapest" -> "Ft"; // Hungarian Forint (HUF)

            case "Europe/Prague" -> "Kč"; // Czech Koruna (CZK)

            // Africa
            case "Africa/Johannesburg" -> "R"; // South African Rand (ZAR)
            case "Africa/Cairo" -> "£";        // Egyptian Pound (EGP)
            case "Africa/Lagos" -> "₦";        // Nigerian Naira (NGN)
            case "Africa/Abidjan", "Africa/Accra", "Africa/Bamako", "Africa/Bissau", "Africa/Conakry",
                 "Africa/Dakar", "Africa/Freetown", "Africa/Banjul", "Africa/Lome", "Africa/Niamey", "Africa/Ouagadougou",
                 "Africa/Porto-Novo", "Africa/Timbuktu", "Africa/Bangui", "Africa/Libreville",
                 "Africa/Malabo", "Africa/Brazzaville", "Africa/Douala", "Africa/Gaborone", "Africa/Harare", "Africa/Kigali",
                 "Africa/Lubumbashi", "Africa/Kampala", "Africa/Ndjamena", "Africa/Nairobi", "Africa/Juba", "Africa/Monrovia",
                 "Africa/Maseru", "Africa/Mbabane", "Africa/Windhoek" -> "XOF"; // CFA Franc (used in many West African countries)

            case "Africa/Asmara", "Africa/Addis_Ababa" -> "Br"; // Ethiopian Birr (ETB)

            case "Africa/Algiers", "Africa/Tunis", "Africa/Tripoli" -> "د.ج"; // Algerian Dinar (DZD), Tunisian Dinar (TND), Libyan Dinar (LYD)

            case "Africa/Maputo" -> "MT"; // Mozambican Metical (MZN)

            case "Africa/Lusaka" -> "ZK"; // Zambian Kwacha (ZMK)

            case "Africa/Blantyre" -> "MWK"; // Malawian Kwacha

            case "Africa/Mogadishu" -> "SOS"; // Somali Shilling

            case "Africa/Djibouti" -> "DJF"; // Djibouti Franc

            case "Africa/Khartoum" -> "SDG"; // Sudanese Pound

            case "Africa/Bujumbura" -> "BIF"; // Burundi Franc

            // Asia - just a few examples
            case "Asia/Kolkata" -> "₹";
            case "Asia/Tokyo" -> "¥";
            case "Asia/Shanghai", "Asia/Hong_Kong" -> "¥";

            // Australia/Oceania
            case "Australia/Sydney", "Australia/Melbourne", "Australia/Brisbane", "Australia/Adelaide",
                 "Australia/Perth", "Australia/Hobart" -> "A$";

            // Default fallback
            default -> "$";
        };
    }

}

class FooterHandler implements IEventHandler {
    private final PdfFont font;

    public FooterHandler(PdfFont font) {
        this.font = font;
    }

    @Override
    public void handleEvent(Event event) {
        PdfDocumentEvent docEvent = (PdfDocumentEvent) event;
        PdfCanvas pdfCanvas = new PdfCanvas(docEvent.getPage());
        Rectangle pageSize = docEvent.getPage().getPageSize();
        float y = pageSize.getBottom() + 15;

        // Left: Page number
        Paragraph pageNumber = new Paragraph("Page " + docEvent.getDocument().getPageNumber(docEvent.getPage())).setFont(font).setFontColor(new DeviceRgb(38, 50, 56)).setBold().setFontSize(10);

        new Canvas(pdfCanvas, pageSize).showTextAligned(pageNumber, pageSize.getLeft() + 40, y, TextAlignment.LEFT).close();

        // Right: "BudgetIQ"
        Paragraph footerText = new Paragraph("BudgetIQ").setFont(font).setFontColor(new DeviceRgb(38, 50, 56)).setBold().setFontSize(12);

        new Canvas(pdfCanvas, pageSize).showTextAligned(footerText, pageSize.getRight() - 40, y, TextAlignment.RIGHT).close();
    }
}

