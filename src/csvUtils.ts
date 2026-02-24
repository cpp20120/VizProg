import { readFile, writeFile } from 'fs/promises';

export function csvToJSON(input: string[], delimiter: string): object[] {
    if (!input || input.length === 0) {
        throw new Error('Input array is empty');
    }

    if (!delimiter || delimiter.length === 0) {
        throw new Error('Delimiter cannot be empty');
    }

    const headers = input[0].split(delimiter);
    
    if (headers.length === 0 || (headers.length === 1 && headers[0].trim() === '')) {
        throw new Error('No headers found');
    }

    const result: object[] = [];

    for (let i = 1; i < input.length; i++) {
        const values = input[i].split(delimiter);
        
        if (values.length !== headers.length) {
            throw new Error(`Row ${i} has ${values.length} fields, expected ${headers.length}`);
        }

        const obj: Record<string, string | number> = {};
        
        for (let j = 0; j < headers.length; j++) {
            const header = headers[j].trim();
            let value: string | number = values[j].trim();
            
            const numValue = Number(value);
            if (!isNaN(numValue) && value !== '') {
                value = numValue;
            }
            
            obj[header] = value;
        }
        
        result.push(obj);
    }

    return result;
}

export async function formatCSVFileToJSONFile(
    input: string, 
    output: string, 
    delimiter: string
): Promise<void> {
    try {
        const fileContent = await readFile(input, 'utf-8');
        
        const lines = fileContent.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length === 0) {
            throw new Error('Input file is empty');
        }

        const jsonData = csvToJSON(lines, delimiter);
        
        await writeFile(output, JSON.stringify(jsonData, null, 2), 'utf-8');
    } catch (error) {
        throw new Error(`Failed to process CSV file: ${error instanceof Error ? error.message : String(error)}`);
    }
}