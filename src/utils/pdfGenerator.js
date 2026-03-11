import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Professional PDF Generator for HU-VMS Reports
// 
// UNIVERSITY LOGO INTEGRATION:
// To add the actual Haramaya University logo to PDFs:
// 1. Convert your logo image to base64 format
// 2. Call: pdfGenerator.setUniversityLogo('data:image/png;base64,YOUR_BASE64_STRING')
// 3. The logo will automatically appear in the top-right corner of all PDF reports
//
// Current implementation uses a professional placeholder that resembles a university seal
class PDFGenerator {
    constructor() {
        this.primaryColor = [74, 144, 226]; // #4a90e2
        this.secondaryColor = [53, 122, 189]; // #357abd
        this.darkColor = [30, 60, 114]; // #1e3c72
        this.textColor = [51, 51, 51];
        this.lightGray = [240, 240, 240];

        // University logo data (base64 encoded image would go here)
        this.universityLogo = null; // Will be set if logo image is available

        // Try to load the university logo
        this.loadUniversityLogo();
    }

    // Method to load university logo from assets
    loadUniversityLogo() {
        try {
            // Try to load the university logo from public folder
            this.loadLogoFromPublicFolder();
            console.log('University logo loading system ready');
        } catch (error) {
            console.log('University logo not available, using placeholder');
        }
    }

    // Load logo from public folder (image.png)
    async loadLogoFromPublicFolder() {
        try {
            // Load the logo from public/Haramaya-768x576.png
            const logoPath = '/Haramaya-768x576.png';
            const response = await fetch(logoPath);

            if (response.ok) {
                const blob = await response.blob();
                const reader = new FileReader();

                reader.onload = (e) => {
                    this.universityLogo = e.target.result;
                    console.log('✅ Haramaya University logo loaded from public/Haramaya-768x576.png');
                };

                reader.readAsDataURL(blob);
            } else {
                console.log('Logo not found at public/Haramaya-768x576.png, using detailed placeholder');
            }
        } catch (error) {
            console.log('Could not load logo from public folder:', error.message);
        }
    }

    // Method to set university logo
    setUniversityLogo(logoBase64) {
        this.universityLogo = logoBase64;
    }

    // Example method to demonstrate logo usage
    // Call this method with your base64 encoded logo string
    setHaramayaLogo(base64String) {
        if (base64String && base64String.startsWith('data:image/')) {
            this.universityLogo = base64String;
            console.log('Haramaya University logo loaded successfully');
        } else {
            console.warn('Invalid logo format. Please provide a valid base64 image string starting with "data:image/"');
        }
    }

    // Method to load logo from a file input or URL
    async loadLogoFromFile(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject('No file provided');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const base64String = e.target.result;
                this.setHaramayaLogo(base64String);
                resolve(base64String);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsDataURL(file);
        });
    }

    // Method to load logo from URL (for web usage)
    async loadLogoFromUrl(imageUrl) {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64String = e.target.result;
                    this.setHaramayaLogo(base64String);
                    resolve(base64String);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Failed to load logo from URL:', error);
            throw error;
        }
    }

    // Add university logo to PDF
    addUniversityLogo(doc, x, y, size = 30) {
        try {
            if (this.universityLogo) {
                // If we have the actual logo image, use it
                doc.addImage(this.universityLogo, 'PNG', x - size / 2, y - size / 2, size, size);
            } else {
                // Create a detailed representation of the Haramaya University logo
                // Based on the circular seal design with colors and elements

                // Outer white circle (seal background)
                doc.setFillColor(255, 255, 255);
                doc.circle(x, y, size / 2, 'F');

                // Outer border (dark)
                doc.setDrawColor(0, 0, 0);
                doc.setLineWidth(1.5);
                doc.circle(x, y, size / 2, 'S');

                // Inner border
                doc.setLineWidth(0.8);
                doc.circle(x, y, size / 2 - 2, 'S');

                // Top section - Orange/Yellow sky with sun
                doc.setFillColor(255, 165, 0); // Orange
                // Create arc for top section
                doc.arc(x, y, size / 3, 0, Math.PI, 'F');

                // Sun rays (simplified yellow lines)
                doc.setDrawColor(255, 215, 0); // Gold
                doc.setLineWidth(1);
                for (let i = 0; i < 6; i++) {
                    const angle = (i * Math.PI / 5) - Math.PI + Math.PI / 6;
                    const startX = x + Math.cos(angle) * (size / 5);
                    const startY = y + Math.sin(angle) * (size / 5);
                    const endX = x + Math.cos(angle) * (size / 3.5);
                    const endY = y + Math.sin(angle) * (size / 3.5);
                    if (startY < y - size / 12) { // Only top rays
                        doc.line(startX, startY, endX, endY);
                    }
                }

                // Middle section - Blue sky
                doc.setFillColor(65, 105, 225); // Royal Blue
                doc.rect(x - size / 3, y - size / 8, size * 2 / 3, size / 8, 'F');

                // Bottom section - Green land
                doc.setFillColor(34, 139, 34); // Forest Green
                doc.rect(x - size / 3, y, size * 2 / 3, size / 3, 'F');

                // Central emblem - Yellow/Orange circle
                doc.setFillColor(255, 200, 0); // Golden Yellow
                doc.circle(x, y + size / 16, size / 7, 'F');

                // Central emblem border
                doc.setDrawColor(200, 100, 0);
                doc.setLineWidth(0.5);
                doc.circle(x, y + size / 16, size / 7, 'S');

                // Atomic/flower symbol in center (simplified)
                doc.setDrawColor(0, 0, 0);
                doc.setLineWidth(0.8);
                // Central dot
                doc.setFillColor(0, 0, 0);
                doc.circle(x, y + size / 16, 1, 'F');

                // Petals/electron orbits (simplified as lines)
                for (let i = 0; i < 6; i++) {
                    const angle = (i * Math.PI * 2) / 6;
                    const petalX = x + Math.cos(angle) * (size / 12);
                    const petalY = y + size / 16 + Math.sin(angle) * (size / 12);
                    doc.line(x, y + size / 16, petalX, petalY);
                    // Small circles at petal ends
                    doc.setFillColor(0, 0, 0);
                    doc.circle(petalX, petalY, 0.5, 'F');
                }

                // Trees on the green section (black triangular shapes)
                doc.setFillColor(0, 0, 0);
                const treePositions = [-size / 4, -size / 8, size / 8, size / 4];
                treePositions.forEach(pos => {
                    // Tree trunk (small rectangle)
                    doc.rect(x + pos - 0.5, y + size / 6, 1, size / 12, 'F');
                    // Tree top (triangle) - using lines to create triangle
                    const treeTopX = x + pos;
                    const treeTopY = y + size / 12;
                    const treeBaseY = y + size / 6;
                    const treeWidth = size / 20;

                    // Draw triangle using lines
                    doc.line(treeTopX, treeTopY, treeTopX - treeWidth, treeBaseY);
                    doc.line(treeTopX, treeTopY, treeTopX + treeWidth, treeBaseY);
                    doc.line(treeTopX - treeWidth, treeBaseY, treeTopX + treeWidth, treeBaseY);
                });

                // University name text around the circle (simplified)
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(size / 12);
                doc.setFont('helvetica', 'bold');

                // Top text
                doc.text('HARAMAYA', x, y - size / 2.5, { align: 'center' });
                // Bottom text  
                doc.text('UNIVERSITY', x, y + size / 2.2, { align: 'center' });
            }

        } catch (error) {
            console.log('University logo rendering error:', error);
            // Fallback: simple text
            doc.setTextColor(...this.primaryColor);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text('HARAMAYA', x, y - 2, { align: 'center' });
            doc.text('UNIVERSITY', x, y + 4, { align: 'center' });
        }
    }

    // Add professional header with logo and title
    addHeader(doc, title, subtitle = '') {
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header background
        doc.setFillColor(...this.primaryColor);
        doc.rect(0, 0, pageWidth, 40, 'F');

        // Add Haramaya University Logo (top right)
        this.addUniversityLogo(doc, pageWidth - 25, 20, 24);

        // Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('HU-VMS', 20, 18);

        doc.setFontSize(14);
        doc.text(title, 20, 28);

        if (subtitle) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(subtitle, 20, 35);
        }

        // Date on right (positioned to not overlap with logo)
        doc.setFontSize(9);
        const dateStr = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.text(dateStr, pageWidth - 80, 12, { align: 'right' });
        doc.text(new Date().toLocaleTimeString('en-US'), pageWidth - 80, 18, { align: 'right' });
    }

    // Add professional footer
    addFooter(doc, pageNumber, totalPages) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        doc.setDrawColor(...this.primaryColor);
        doc.setLineWidth(0.5);
        doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);

        doc.setTextColor(...this.textColor);
        doc.setFontSize(8);
        doc.text('Haramaya University - Vehicle Management System', 20, pageHeight - 12);
        doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 20, pageHeight - 12, { align: 'right' });
        doc.text('Generated by HU-VMS Driver Portal', pageWidth / 2, pageHeight - 12, { align: 'center' });
    }

    // Add recipient information
    addRecipient(doc, recipient, yPos = 50) {
        doc.setFillColor(...this.lightGray);
        doc.roundedRect(20, yPos, 170, 25, 3, 3, 'F');

        doc.setTextColor(...this.darkColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('TO:', 25, yPos + 8);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(recipient.name, 25, yPos + 15);
        doc.setFontSize(9);
        doc.text(recipient.department, 25, yPos + 21);
    }

    // Generate Fuel Report PDF
    generateFuelReport(data, recipient = 'Admin') {
        const doc = new jsPDF();

        this.addHeader(doc, 'Fuel Report', 'Driver Fuel Management');

        // Recipient
        const recipientInfo = {
            name: recipient === 'Admin' ? 'Administration Office' : 'Transport Office',
            department: recipient === 'Admin' ? 'University Administration' : 'Transport Management Department'
        };
        this.addRecipient(doc, recipientInfo, 50);

        // Report Details
        doc.setTextColor(...this.darkColor);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Report Details', 20, 90);

        // Report Type Badge
        const reportType = data.reportType === 'refill' ? 'FUEL REFILL' : 'FUEL CONSUMPTION';
        doc.setFillColor(...this.primaryColor);
        doc.roundedRect(20, 95, 50, 10, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(reportType, 45, 101.5, { align: 'center' });

        // Details Table
        const tableData = [
            ['Date', data.date || new Date().toLocaleDateString()],
            ['Amount', `${data.amount} Liters`],
            ['Odometer Reading', `${data.odometer} km`]
        ];

        if (data.reportType === 'refill') {
            tableData.push(['Cost', `${data.cost} ETB`]);
            if (data.station) {
                tableData.push(['Gas Station', data.station]);
            }
        }

        tableData.push(['Driver Name', data.driverName || 'John Doe']);
        tableData.push(['Vehicle ID', data.vehicleId || 'VEH-001']);
        tableData.push(['License Plate', data.licensePlate || 'ABC-1234']);

        doc.autoTable({
            startY: 110,
            head: [],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: this.primaryColor,
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 10,
                cellPadding: 5
            },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 60 },
                1: { cellWidth: 110 }
            },
            margin: { left: 20, right: 20 }
        });

        // Notes section
        if (data.notes) {
            const finalY = doc.lastAutoTable.finalY + 15;
            doc.setTextColor(...this.darkColor);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Additional Notes:', 20, finalY);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(...this.textColor);
            const splitNotes = doc.splitTextToSize(data.notes, 170);
            doc.text(splitNotes, 20, finalY + 7);
        }

        // Signature section
        const pageHeight = doc.internal.pageSize.getHeight();
        const signatureY = pageHeight - 60;

        doc.setDrawColor(...this.primaryColor);
        doc.line(20, signatureY, 90, signatureY);
        doc.setTextColor(...this.textColor);
        doc.setFontSize(9);
        doc.text('Driver Signature', 20, signatureY + 5);
        doc.setFontSize(8);
        doc.text(new Date().toLocaleString(), 20, signatureY + 10);

        this.addFooter(doc, 1, 1);

        // Save PDF
        const fileName = `Fuel_Report_${data.reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);

        return fileName;
    }

    // Generate Vehicle Issue Report PDF
    generateVehicleIssueReport(data, recipient = 'Admin') {
        const doc = new jsPDF();

        this.addHeader(doc, 'Vehicle Issue Report', 'Maintenance & Issue Reporting');

        const recipientInfo = {
            name: recipient === 'Admin' ? 'Administration Office' : 'Transport Office',
            department: recipient === 'Admin' ? 'University Administration' : 'Transport Management Department'
        };
        this.addRecipient(doc, recipientInfo, 50);

        // Issue Priority Badge
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Issue Report', 20, 90);

        const priorityColors = {
            low: [76, 175, 80],
            medium: [255, 152, 0],
            high: [244, 67, 54]
        };
        const priority = data.priority || 'medium';
        doc.setFillColor(...priorityColors[priority]);
        doc.roundedRect(20, 95, 45, 10, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text(priority.toUpperCase() + ' PRIORITY', 42.5, 101.5, { align: 'center' });

        // Issue Details
        const tableData = [
            ['Report Date', data.date || new Date().toLocaleDateString()],
            ['Issue Type', data.issueType || 'Mechanical'],
            ['Priority Level', priority.toUpperCase()],
            ['Vehicle ID', data.vehicleId || 'VEH-001'],
            ['License Plate', data.licensePlate || 'ABC-1234'],
            ['Current Odometer', `${data.odometer || 'N/A'} km`],
            ['Driver Name', data.driverName || 'John Doe']
        ];

        doc.autoTable({
            startY: 110,
            body: tableData,
            theme: 'striped',
            styles: { fontSize: 10, cellPadding: 5 },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 60 },
                1: { cellWidth: 110 }
            },
            margin: { left: 20, right: 20 }
        });

        // Issue Description
        const descY = doc.lastAutoTable.finalY + 15;
        doc.setTextColor(...this.darkColor);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Issue Description:', 20, descY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...this.textColor);
        const splitDesc = doc.splitTextToSize(data.description || 'No description provided', 170);
        doc.text(splitDesc, 20, descY + 7);

        // Signature
        const pageHeight = doc.internal.pageSize.getHeight();
        const signatureY = pageHeight - 60;

        doc.setDrawColor(...this.primaryColor);
        doc.line(20, signatureY, 90, signatureY);
        doc.setTextColor(...this.textColor);
        doc.setFontSize(9);
        doc.text('Driver Signature', 20, signatureY + 5);
        doc.setFontSize(8);
        doc.text(new Date().toLocaleString(), 20, signatureY + 10);

        this.addFooter(doc, 1, 1);

        const fileName = `Vehicle_Issue_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);

        return fileName;
    }

    // Generate Complaint Report PDF
    generateComplaintReport(data, recipient = 'Admin') {
        const doc = new jsPDF();

        this.addHeader(doc, 'Complaint Report', 'Driver Complaint Submission');

        const recipientInfo = {
            name: recipient === 'Admin' ? 'Administration Office' : 'Transport Office',
            department: recipient === 'Admin' ? 'University Administration' : 'Transport Management Department'
        };
        this.addRecipient(doc, recipientInfo, 50);

        doc.setTextColor(...this.darkColor);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Complaint Details', 20, 90);

        const tableData = [
            ['Submission Date', data.date || new Date().toLocaleDateString()],
            ['Complaint Type', data.type || 'General'],
            ['Driver Name', data.driverName || 'John Doe'],
            ['Vehicle ID', data.vehicleId || 'VEH-001'],
            ['Contact', data.contact || 'N/A']
        ];

        doc.autoTable({
            startY: 95,
            body: tableData,
            theme: 'striped',
            styles: { fontSize: 10, cellPadding: 5 },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 60 },
                1: { cellWidth: 110 }
            },
            margin: { left: 20, right: 20 }
        });

        const descY = doc.lastAutoTable.finalY + 15;
        doc.setTextColor(...this.darkColor);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Complaint Description:', 20, descY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...this.textColor);
        const splitDesc = doc.splitTextToSize(data.description || 'No description provided', 170);
        doc.text(splitDesc, 20, descY + 7);

        const pageHeight = doc.internal.pageSize.getHeight();
        const signatureY = pageHeight - 60;

        doc.setDrawColor(...this.primaryColor);
        doc.line(20, signatureY, 90, signatureY);
        doc.setTextColor(...this.textColor);
        doc.setFontSize(9);
        doc.text('Driver Signature', 20, signatureY + 5);
        doc.setFontSize(8);
        doc.text(new Date().toLocaleString(), 20, signatureY + 10);

        this.addFooter(doc, 1, 1);

        const fileName = `Complaint_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);

        return fileName;
    }

    // Generate Fuel Station Report PDF
    generateFuelStationReport(data, recipient = 'Admin') {
        const doc = new jsPDF();

        this.addHeader(doc, 'Fuel Station Report', `${data.period} Report - ${data.startDate} to ${data.endDate}`);

        // Recipient Information
        const recipientInfo = {
            name: recipient === 'Admin' ? 'Administration Office' :
                recipient === 'Transport Office' ? 'Transport Office' :
                    'Administration & Transport Offices',
            department: recipient === 'Admin' ? 'University Administration' :
                recipient === 'Transport Office' ? 'Transport Management Department' :
                    'University Administration & Transport Management'
        };
        this.addRecipient(doc, recipientInfo, 50);

        // Report Type Badge
        doc.setFillColor(...this.primaryColor);
        doc.roundedRect(20, 82, 60, 10, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(data.period.toUpperCase() + ' REPORT', 50, 88.5, { align: 'center' });

        let currentY = 100;

        // Summary Statistics Section
        if (data.includeSummary) {
            doc.setTextColor(...this.darkColor);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('📊 Summary Statistics', 20, currentY);

            const summaryData = [
                ['Total Fuel Dispensed', `${data.totalFuel} Liters`],
                ['Diesel Dispensed', `${data.dieselDispensed} Liters`],
                ['Petrol Dispensed', `${data.petrolDispensed} Liters`],
                ['Total Transactions', data.totalTransactions.toString()],
                ['Completed Transactions', data.completedTransactions.toString()],
                ['Pending Authorizations', data.pendingAuthorizations.toString()]
            ];

            doc.autoTable({
                startY: currentY + 5,
                body: summaryData,
                theme: 'striped',
                headStyles: {
                    fillColor: this.primaryColor,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                styles: {
                    fontSize: 10,
                    cellPadding: 5
                },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 80 },
                    1: { cellWidth: 90 }
                },
                margin: { left: 20, right: 20 }
            });

            currentY = doc.lastAutoTable.finalY + 15;
        }

        // Inventory Status Section
        if (data.includeInventory) {
            doc.setTextColor(...this.darkColor);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('📦 Current Inventory Status', 20, currentY);

            const inventoryData = [
                ['Diesel Available', `${data.dieselAvailable} Liters`],
                ['Petrol Available', `${data.petrolAvailable} Liters`],
                ['Total Fuel in Stock', `${data.dieselAvailable + data.petrolAvailable} Liters`]
            ];

            doc.autoTable({
                startY: currentY + 5,
                body: inventoryData,
                theme: 'striped',
                styles: {
                    fontSize: 10,
                    cellPadding: 5
                },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 80 },
                    1: { cellWidth: 90 }
                },
                margin: { left: 20, right: 20 }
            });

            currentY = doc.lastAutoTable.finalY + 15;
        }

        // Transaction Details Section
        if (data.includeTransactions) {
            doc.setTextColor(...this.darkColor);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('💳 Transaction Summary', 20, currentY);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...this.textColor);
            doc.text(`This ${data.period.toLowerCase()} period includes ${data.totalTransactions} total transactions,`, 20, currentY + 7);
            doc.text(`with ${data.completedTransactions} successfully completed and ${data.pendingAuthorizations} pending authorization.`, 20, currentY + 14);

            currentY += 25;
        }

        // Report Metadata
        doc.setFillColor(...this.lightGray);
        doc.roundedRect(20, currentY, 170, 35, 3, 3, 'F');

        doc.setTextColor(...this.darkColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Report Information', 25, currentY + 8);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...this.textColor);
        doc.text(`Generated By: ${data.generatedBy}`, 25, currentY + 15);
        doc.text(`Report Date: ${data.date}`, 25, currentY + 21);
        doc.text(`Recipient: ${recipient}`, 25, currentY + 27);

        // Signature Section
        const pageHeight = doc.internal.pageSize.getHeight();
        const signatureY = pageHeight - 60;

        doc.setDrawColor(...this.primaryColor);
        doc.line(20, signatureY, 90, signatureY);
        doc.line(120, signatureY, 190, signatureY);

        doc.setTextColor(...this.textColor);
        doc.setFontSize(9);
        doc.text('Fuel Station Officer', 20, signatureY + 5);
        doc.text('Authorized Signature', 120, signatureY + 5);

        doc.setFontSize(8);
        doc.text(new Date().toLocaleString(), 20, signatureY + 10);

        this.addFooter(doc, 1, 1);

        // Save PDF
        const fileName = `Fuel_Station_Report_${data.period}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);

        return fileName;
    }

    // Generate Trip Report PDF
    generateTripReport(data, recipient = 'Admin') {
        const doc = new jsPDF();

        this.addHeader(doc, 'Trip Report', 'Trip Summary & Details');

        const recipientInfo = {
            name: recipient === 'Admin' ? 'Administration Office' : 'Transport Office',
            department: recipient === 'Admin' ? 'University Administration' : 'Transport Management Department'
        };
        this.addRecipient(doc, recipientInfo, 50);

        doc.setTextColor(...this.darkColor);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Trip Information', 20, 90);

        const tableData = [
            ['Trip ID', data.tripId || 'N/A'],
            ['Date', data.date || new Date().toLocaleDateString()],
            ['Driver Name', data.driverName || 'John Doe'],
            ['Vehicle ID', data.vehicleId || 'VEH-001'],
            ['Pickup Location', data.pickupLocation || 'N/A'],
            ['Destination', data.destination || 'N/A'],
            ['Start Time', data.startTime || 'N/A'],
            ['End Time', data.endTime || 'N/A'],
            ['Distance', `${data.distance || 'N/A'} km`],
            ['Fuel Used', `${data.fuelUsed || 'N/A'} L`],
            ['Status', data.status || 'Completed']
        ];

        doc.autoTable({
            startY: 95,
            body: tableData,
            theme: 'striped',
            styles: { fontSize: 10, cellPadding: 5 },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 60 },
                1: { cellWidth: 110 }
            },
            margin: { left: 20, right: 20 }
        });

        if (data.notes) {
            const notesY = doc.lastAutoTable.finalY + 15;
            doc.setTextColor(...this.darkColor);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Trip Notes:', 20, notesY);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(...this.textColor);
            const splitNotes = doc.splitTextToSize(data.notes, 170);
            doc.text(splitNotes, 20, notesY + 7);
        }

        const pageHeight = doc.internal.pageSize.getHeight();
        const signatureY = pageHeight - 60;

        doc.setDrawColor(...this.primaryColor);
        doc.line(20, signatureY, 90, signatureY);
        doc.setTextColor(...this.textColor);
        doc.setFontSize(9);
        doc.text('Driver Signature', 20, signatureY + 5);
        doc.setFontSize(8);
        doc.text(new Date().toLocaleString(), 20, signatureY + 10);

        this.addFooter(doc, 1, 1);

        const fileName = `Trip_Report_${data.tripId || 'Unknown'}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);

        return fileName;
    }

    // Generate Gate Security Report PDF
    generateGateSecurityReport(data, recipient = 'Admin') {
        const doc = new jsPDF();

        this.addHeader(doc, 'Gate Security Report', `${data.period} Security Operations Report`);

        // Recipient
        const recipientInfo = {
            name: recipient === 'Admin' ? 'Administration Office' :
                recipient === 'Security Department' ? 'Security Department' :
                    recipient === 'Transport Office' ? 'Transport Office' : 'All Departments',
            department: recipient === 'Admin' ? 'University Administration' :
                recipient === 'Security Department' ? 'Campus Security Department' :
                    recipient === 'Transport Office' ? 'Transport Management Department' : 'Multiple Departments'
        };
        this.addRecipient(doc, recipientInfo, 50);

        // Report Period Badge
        doc.setFillColor(...this.primaryColor);
        doc.roundedRect(20, 85, 60, 12, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(data.period.toUpperCase(), 50, 92.5, { align: 'center' });

        // Report period
        doc.setTextColor(...this.textColor);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Period: ${data.startDate} to ${data.endDate}`, 85, 92);

        // Vehicle Movement Summary
        if (data.includeVehicleMovements) {
            doc.setTextColor(...this.darkColor);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('🚗 Vehicle Movement Summary', 20, 115);

            const movementData = [
                ['Total Vehicle Entries', data.totalEntries.toString()],
                ['Total Vehicle Exits', data.totalExits.toString()],
                ['Pending Vehicles', data.pendingVehicles.toString()],
                ['ALPR Detections', data.alprDetections.toString()]
            ];

            doc.autoTable({
                startY: 120,
                head: [['Metric', 'Count']],
                body: movementData,
                theme: 'striped',
                headStyles: {
                    fillColor: this.primaryColor,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                styles: {
                    fontSize: 10,
                    cellPadding: 5
                },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 80 },
                    1: { cellWidth: 40, halign: 'center' }
                },
                margin: { left: 20, right: 20 }
            });
        }

        // Trip Authorization Summary
        if (data.includeAuthorizations) {
            const startY = data.includeVehicleMovements ? doc.lastAutoTable.finalY + 15 : 120;

            doc.setTextColor(...this.darkColor);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('✅ Trip Authorization Summary', 20, startY);

            const authData = [
                ['Authorized Trips', data.authorizedTrips.toString()],
                ['Rejected Trips', data.rejectedTrips.toString()],
                ['Average Processing Time', `${data.averageProcessingTime} minutes`]
            ];

            doc.autoTable({
                startY: startY + 5,
                head: [['Authorization Metric', 'Value']],
                body: authData,
                theme: 'striped',
                headStyles: {
                    fillColor: [16, 185, 129], // Green for authorizations
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                styles: {
                    fontSize: 10,
                    cellPadding: 5
                },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 80 },
                    1: { cellWidth: 40, halign: 'center' }
                },
                margin: { left: 20, right: 20 }
            });
        }

        // Vehicle Inspections
        if (data.includeInspections) {
            const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 120;

            doc.setTextColor(...this.darkColor);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('🔧 Vehicle Inspection Summary', 20, startY);

            const inspectionData = [
                ['Inspections Completed', data.inspectionsCompleted.toString()]
            ];

            doc.autoTable({
                startY: startY + 5,
                head: [['Inspection Metric', 'Count']],
                body: inspectionData,
                theme: 'striped',
                headStyles: {
                    fillColor: [245, 158, 11], // Orange for inspections
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                styles: {
                    fontSize: 10,
                    cellPadding: 5
                },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 80 },
                    1: { cellWidth: 40, halign: 'center' }
                },
                margin: { left: 20, right: 20 }
            });
        }

        // Security Incidents
        if (data.includeSecurityIncidents) {
            const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 120;

            doc.setTextColor(...this.darkColor);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('⚠️ Security Incidents Summary', 20, startY);

            const securityData = [
                ['Security Incidents', data.securityIncidents.toString()],
                ['Unauthorized Attempts', data.unauthorizedAttempts.toString()]
            ];

            doc.autoTable({
                startY: startY + 5,
                head: [['Security Metric', 'Count']],
                body: securityData,
                theme: 'striped',
                headStyles: {
                    fillColor: [239, 68, 68], // Red for security incidents
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                styles: {
                    fontSize: 10,
                    cellPadding: 5
                },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 80 },
                    1: { cellWidth: 40, halign: 'center' }
                },
                margin: { left: 20, right: 20 }
            });
        }

        // Summary Section
        const summaryY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 180;

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(20, summaryY, 170, 35, 3, 3, 'F');

        doc.setTextColor(...this.darkColor);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('📊 Report Summary', 25, summaryY + 10);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...this.textColor);

        const summaryText = [
            `This ${data.period.toLowerCase()} security report covers the period from ${data.startDate} to ${data.endDate}.`,
            `Total vehicle movements: ${data.totalEntries + data.totalExits} (${data.totalEntries} entries, ${data.totalExits} exits)`,
            `Security status: ${data.securityIncidents} incidents reported, ${data.unauthorizedAttempts} unauthorized attempts`,
            `Operational efficiency: ${data.authorizedTrips} trips authorized with avg. ${data.averageProcessingTime}min processing time`
        ];

        let textY = summaryY + 17;
        summaryText.forEach(line => {
            doc.text(line, 25, textY);
            textY += 4;
        });

        // Officer signature section
        const pageHeight = doc.internal.pageSize.getHeight();
        const signatureY = pageHeight - 60;

        doc.setDrawColor(...this.primaryColor);
        doc.line(20, signatureY, 90, signatureY);
        doc.line(110, signatureY, 180, signatureY);

        doc.setTextColor(...this.textColor);
        doc.setFontSize(9);
        doc.text('Gate Security Officer', 20, signatureY + 5);
        doc.text('Supervisor Approval', 110, signatureY + 5);

        doc.setFontSize(8);
        doc.text(data.generatedBy || 'Gate Security Officer', 20, signatureY + 10);
        doc.text(data.date, 20, signatureY + 15);

        this.addFooter(doc, 1, 1);

        // Save PDF
        const fileName = `Gate_Security_Report_${data.period}_${data.startDate.replace(/-/g, '')}.pdf`;
        doc.save(fileName);

        return fileName;
    }
    generateDriverReport(data, recipient = 'Admin') {
        const doc = new jsPDF();

        // Add university logo
        this.addUniversityLogo(doc, 160, 10);

        // Add header
        this.addHeader(doc, 'DRIVER PERFORMANCE REPORT', `${data.period} Report`);

        // Add recipient
        const recipientInfo = {
            name: recipient,
            department: recipient === 'Admin' ? 'University Administration' :
                recipient === 'Transport Office' ? 'Transport Management Department' :
                    recipient === 'HR Department' ? 'Human Resources Department' :
                        'Multiple Departments'
        };
        this.addRecipient(doc, recipientInfo, 50);

        let yPos = 70;

        // Report period
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Report Period:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(`${data.startDate} to ${data.endDate}`, 60, yPos);
        yPos += 15;

        // Driver Information
        doc.setFont('helvetica', 'bold');
        doc.text('Generated By:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(data.generatedBy, 60, yPos);
        yPos += 10;

        doc.setFont('helvetica', 'bold');
        doc.text('Report Date:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(data.date, 60, yPos);
        yPos += 20;

        // Trip Summary Section
        if (data.includeTripSummary) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('🚗 TRIP SUMMARY', 20, yPos);
            yPos += 15;

            const tripData = [
                ['Total Trips', data.totalTrips],
                ['Completed Trips', data.completedTrips],
                ['Cancelled Trips', data.cancelledTrips],
                ['Total Distance', `${data.totalDistance} km`],
                ['Completion Rate', `${((data.completedTrips / data.totalTrips) * 100).toFixed(1)}%`]
            ];

            doc.autoTable({
                startY: yPos,
                head: [['Metric', 'Value']],
                body: tripData,
                theme: 'grid',
                headStyles: { fillColor: [40, 167, 69] },
                margin: { left: 20, right: 20 }
            });

            yPos = doc.lastAutoTable.finalY + 15;
        }

        // Fuel Usage Section
        if (data.includeFuelUsage) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('⛽ FUEL USAGE & EFFICIENCY', 20, yPos);
            yPos += 15;

            const fuelData = [
                ['Total Fuel Used', `${data.totalFuelUsed} L`],
                ['Average Fuel Efficiency', `${data.averageFuelEfficiency} km/L`],
                ['Fuel Cost Efficiency', 'Excellent'],
                ['Environmental Impact', 'Low Carbon Footprint']
            ];

            doc.autoTable({
                startY: yPos,
                head: [['Metric', 'Value']],
                body: fuelData,
                theme: 'grid',
                headStyles: { fillColor: [40, 167, 69] },
                margin: { left: 20, right: 20 }
            });

            yPos = doc.lastAutoTable.finalY + 15;
        }

        // Vehicle Status Section
        if (data.includeVehicleStatus) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('🔧 VEHICLE STATUS & MAINTENANCE', 20, yPos);
            yPos += 15;

            const vehicleData = [
                ['Vehicle Inspections', data.vehicleInspections],
                ['Maintenance Issues', data.maintenanceIssues],
                ['Vehicle Condition', data.maintenanceIssues === 0 ? 'Excellent' : 'Needs Attention'],
                ['Safety Compliance', '100%']
            ];

            doc.autoTable({
                startY: yPos,
                head: [['Metric', 'Value']],
                body: vehicleData,
                theme: 'grid',
                headStyles: { fillColor: [40, 167, 69] },
                margin: { left: 20, right: 20 }
            });

            yPos = doc.lastAutoTable.finalY + 15;
        }

        // Performance Metrics Section
        if (data.includePerformance) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('📈 PERFORMANCE METRICS', 20, yPos);
            yPos += 15;

            const performanceData = [
                ['On-Time Performance', `${data.onTimePerformance}%`],
                ['Working Hours', `${data.workingHours} hrs`],
                ['Overtime Hours', `${data.overtimeHours} hrs`],
                ['Productivity Rating', data.onTimePerformance >= 90 ? 'Excellent' : data.onTimePerformance >= 80 ? 'Good' : 'Needs Improvement'],
                ['Overall Rating', this.calculateDriverRating(data)]
            ];

            doc.autoTable({
                startY: yPos,
                head: [['Metric', 'Value']],
                body: performanceData,
                theme: 'grid',
                headStyles: { fillColor: [40, 167, 69] },
                margin: { left: 20, right: 20 }
            });

            yPos = doc.lastAutoTable.finalY + 15;
        }

        // Summary and Recommendations
        if (yPos > 250) {
            doc.addPage();
            yPos = 30;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('📋 SUMMARY & RECOMMENDATIONS', 20, yPos);
        yPos += 15;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const recommendations = this.generateDriverRecommendations(data);
        recommendations.forEach(rec => {
            doc.text(`• ${rec}`, 25, yPos);
            yPos += 8;
        });

        // Add footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            this.addFooter(doc, i, pageCount);
        }

        // Save the PDF
        const fileName = `Driver_Report_${data.period}_${data.startDate}_to_${data.endDate}.pdf`;
        doc.save(fileName);

        return fileName;
    }

    calculateDriverRating(data) {
        const onTimeScore = parseFloat(data.onTimePerformance);
        const completionRate = (data.completedTrips / data.totalTrips) * 100;
        const maintenanceScore = data.maintenanceIssues === 0 ? 100 : Math.max(0, 100 - (data.maintenanceIssues * 20));

        const overallScore = (onTimeScore + completionRate + maintenanceScore) / 3;

        if (overallScore >= 95) return 'Outstanding (A+)';
        if (overallScore >= 90) return 'Excellent (A)';
        if (overallScore >= 85) return 'Very Good (B+)';
        if (overallScore >= 80) return 'Good (B)';
        if (overallScore >= 75) return 'Satisfactory (C+)';
        if (overallScore >= 70) return 'Acceptable (C)';
        return 'Needs Improvement (D)';
    }

    generateDriverRecommendations(data) {
        const recommendations = [];

        const onTimePerf = parseFloat(data.onTimePerformance);
        const completionRate = (data.completedTrips / data.totalTrips) * 100;
        const fuelEfficiency = parseFloat(data.averageFuelEfficiency);

        if (onTimePerf >= 95) {
            recommendations.push('Excellent punctuality! Continue maintaining high standards.');
        } else if (onTimePerf >= 85) {
            recommendations.push('Good time management. Consider route optimization for better punctuality.');
        } else {
            recommendations.push('Focus on improving punctuality through better trip planning and time management.');
        }

        if (completionRate >= 95) {
            recommendations.push('Outstanding trip completion rate. Excellent reliability.');
        } else if (completionRate < 90) {
            recommendations.push('Work on reducing trip cancellations through better communication and planning.');
        }

        if (fuelEfficiency >= 9.0) {
            recommendations.push('Excellent fuel efficiency! Your eco-friendly driving saves costs.');
        } else if (fuelEfficiency >= 7.0) {
            recommendations.push('Consider eco-driving techniques to improve fuel efficiency.');
        } else {
            recommendations.push('Focus on fuel-efficient driving practices to reduce operational costs.');
        }

        if (data.maintenanceIssues === 0) {
            recommendations.push('Great vehicle care! Continue regular maintenance checks.');
        } else {
            recommendations.push('Increase attention to vehicle maintenance and pre-trip inspections.');
        }

        if (parseFloat(data.overtimeHours) > 5) {
            recommendations.push('Monitor overtime hours to maintain work-life balance and safety.');
        }

        return recommendations;
    }
}

export default new PDFGenerator();