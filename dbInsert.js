const fs = require('fs');
const mammoth = require('mammoth');
const mysql = require('mysql2/promise');

// MySQL database configuration
const dbConfig = {
    host: 'localhost',
    user: 'yourusername',
    password: 'yourpassword',
    database: 'yourdatabase'
};

async function extractText(filePath) {
    try {
        const data = await fs.promises.readFile(filePath);
        const result = await mammoth.extractRawText({ buffer: data });
        return result.value; // Extracted text
    } catch (error) {
        console.error('Error reading file:', error);
    }
}

async function insertDataIntoDatabase(parsedData) {
    const connection = await mysql.createConnection(dbConfig);

    try {
        await connection.beginTransaction();

        // Replace with your own SQL queries to insert data
        for (const item of parsedData) {
            await connection.query(
                'INSERT INTO your_table_name (question, option_a, option_b, option_c, option_d, answer) VALUES (?, ?, ?, ?, ?, ?)',
                [item.question, item.option_a, item.option_b, item.option_c, item.option_d, item.answer]
            );
        }

        await connection.commit();
        console.log('Data inserted successfully');
    } catch (error) {
        await connection.rollback();
        console.error('Error inserting data:', error);
    } finally {
        await connection.end();
    }
}

function parseExtractedText(text) {
    // Custom parsing logic to convert the raw text into structured data
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const parsedData = [];

    for (let i = 0; i < lines.length; i += 2) {
        const questionLine = lines[i].trim();
        const optionsLine = lines[i + 1].trim();

        const question = questionLine.split('\t')[0].trim();
        const options = optionsLine.split(/\s*\(\w\)\s*/).filter(opt => opt.trim() !== '');
        const answer = optionsLine.match(/\((\w)\)/)[1].trim();

        parsedData.push({
            question,
            option_a: options[0],
            option_b: options[1],
            option_c: options[2],
            option_d: options[3],
            answer
        });
    }

    return parsedData;
}

(async () => {
    const filePath = 'path/to/your/file.docx';
    const extractedText = await extractText(filePath);
    const parsedData = parseExtractedText(extractedText);
    await insertDataIntoDatabase(parsedData);
})();
