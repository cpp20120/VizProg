import { csvToJSON, formatCSVFileToJSONFile } from '../csvUtils';
import { readFile, writeFile } from 'fs/promises';

jest.mock('fs/promises', () => ({
    readFile: jest.fn(),
    writeFile: jest.fn()
}));

describe('csvToJSON', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should convert valid CSV data to JSON', () => {
        const input = ["p1;p2;p3;p4", "1;A;b;c", "2;B;v;d"];
        const delimiter = ';';
        
        const result = csvToJSON(input, delimiter);
        
        expect(result).toEqual([
            { p1: 1, p2: 'A', p3: 'b', p4: 'c' },
            { p1: 2, p2: 'B', p3: 'v', p4: 'd' }
        ]);
    });

    test('should handle numeric values correctly', () => {
        const input = ["name;age;score", "John;25;95.5", "Alice;30;87"];
        const delimiter = ';';
        
        const result = csvToJSON(input, delimiter);
        
        expect(result).toEqual([
            { name: 'John', age: 25, score: 95.5 },
            { name: 'Alice', age: 30, score: 87 }
        ]);
    });

    test('should handle empty values', () => {
        const input = ["name;age;city", "John;;New York", "Alice;30;"];
        const delimiter = ';';
        
        const result = csvToJSON(input, delimiter);
        
        expect(result).toEqual([
            { name: 'John', age: '', city: 'New York' },
            { name: 'Alice', age: 30, city: '' }
        ]);
    });

    test('should throw error when input array is empty', () => {
        expect(() => csvToJSON([], ';')).toThrow('Input array is empty');
    });

    test('should throw error when delimiter is empty', () => {
        const input = ["p1;p2", "1;2"];
        expect(() => csvToJSON(input, '')).toThrow('Delimiter cannot be empty');
    });

    test('should throw error when no headers found', () => {
        const input = [""];
        expect(() => csvToJSON(input, ';')).toThrow('No headers found');
    });

    test('should throw error when row has incorrect number of fields', () => {
        const input = ["p1;p2;p3", "1;2", "3;4;5"];
        expect(() => csvToJSON(input, ';')).toThrow('Row 1 has 2 fields, expected 3');
    });

    test('should handle different delimiters', () => {
        const input = ["name,age,city", "John,25,New York", "Alice,30,London"];
        const delimiter = ',';
        
        const result = csvToJSON(input, delimiter);
        
        expect(result).toEqual([
            { name: 'John', age: 25, city: 'New York' },
            { name: 'Alice', age: 30, city: 'London' }
        ]);
    });

    test('should trim whitespace from headers and values', () => {
        const input = [" name ; age ; city ", " John ; 25 ; New York "];
        const delimiter = ';';
        
        const result = csvToJSON(input, delimiter);
        
        expect(result).toEqual([
            { name: 'John', age: 25, city: 'New York' }
        ]);
    });
});

describe('formatCSVFileToJSONFile', () => {
    const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;
    const mockWriteFile = writeFile as jest.MockedFunction<typeof writeFile>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully convert CSV file to JSON file', async () => {
        const mockCSVContent = "name;age;city\nJohn;25;New York\nAlice;30;London";
        const inputPath = 'input.csv';
        const outputPath = 'output.json';
        const delimiter = ';';

        mockReadFile.mockResolvedValue(mockCSVContent);
        mockWriteFile.mockResolvedValue();

        await formatCSVFileToJSONFile(inputPath, outputPath, delimiter);

        expect(mockReadFile).toHaveBeenCalledWith(inputPath, 'utf-8');
        expect(mockReadFile).toHaveBeenCalledTimes(1);
        
        const expectedJSON = JSON.stringify([
            { name: 'John', age: 25, city: 'New York' },
            { name: 'Alice', age: 30, city: 'London' }
        ], null, 2);
        
        expect(mockWriteFile).toHaveBeenCalledWith(outputPath, expectedJSON, 'utf-8');
        expect(mockWriteFile).toHaveBeenCalledTimes(1);
    });

    test('should handle empty lines in CSV file', async () => {
        const mockCSVContent = "name;age;city\n\nJohn;25;New York\n\nAlice;30;London\n";
        const inputPath = 'input.csv';
        const outputPath = 'output.json';
        const delimiter = ';';

        mockReadFile.mockResolvedValue(mockCSVContent);
        mockWriteFile.mockResolvedValue();

        await formatCSVFileToJSONFile(inputPath, outputPath, delimiter);

        const expectedJSON = JSON.stringify([
            { name: 'John', age: 25, city: 'New York' },
            { name: 'Alice', age: 30, city: 'London' }
        ], null, 2);
        
        expect(mockWriteFile).toHaveBeenCalledWith(outputPath, expectedJSON, 'utf-8');
    });

    test('should throw error when input file is empty', async () => {
        const inputPath = 'input.csv';
        const outputPath = 'output.json';
        const delimiter = ';';

        mockReadFile.mockResolvedValue('');

        await expect(formatCSVFileToJSONFile(inputPath, outputPath, delimiter))
            .rejects
            .toThrow('Failed to process CSV file: Input file is empty');
        
        expect(mockWriteFile).not.toHaveBeenCalled();
    });

    test('should throw error when readFile fails', async () => {
        const inputPath = 'input.csv';
        const outputPath = 'output.json';
        const delimiter = ';';

        mockReadFile.mockRejectedValue(new Error('File not found'));

        await expect(formatCSVFileToJSONFile(inputPath, outputPath, delimiter))
            .rejects
            .toThrow('Failed to process CSV file: File not found');
        
        expect(mockWriteFile).not.toHaveBeenCalled();
    });

    test('should throw error when csvToJSON fails', async () => {
        const mockCSVContent = "name;age\nJohn;25;Extra";
        const inputPath = 'input.csv';
        const outputPath = 'output.json';
        const delimiter = ';';

        mockReadFile.mockResolvedValue(mockCSVContent);

        await expect(formatCSVFileToJSONFile(inputPath, outputPath, delimiter))
            .rejects
            .toThrow('Failed to process CSV file: Row 1 has 3 fields, expected 2');
        
        expect(mockWriteFile).not.toHaveBeenCalled();
    });

    test('should throw error when writeFile fails', async () => {
        const mockCSVContent = "name;age\nJohn;25";
        const inputPath = 'input.csv';
        const outputPath = 'output.json';
        const delimiter = ';';

        mockReadFile.mockResolvedValue(mockCSVContent);
        mockWriteFile.mockRejectedValue(new Error('Permission denied'));

        await expect(formatCSVFileToJSONFile(inputPath, outputPath, delimiter))
            .rejects
            .toThrow('Failed to process CSV file: Permission denied');
    });

    test('should handle different delimiters correctly', async () => {
        const mockCSVContent = "name,age,city\nJohn,25,New York\nAlice,30,London";
        const inputPath = 'input.csv';
        const outputPath = 'output.json';
        const delimiter = ',';

        mockReadFile.mockResolvedValue(mockCSVContent);
        mockWriteFile.mockResolvedValue();

        await formatCSVFileToJSONFile(inputPath, outputPath, delimiter);

        const expectedJSON = JSON.stringify([
            { name: 'John', age: 25, city: 'New York' },
            { name: 'Alice', age: 30, city: 'London' }
        ], null, 2);
        
        expect(mockWriteFile).toHaveBeenCalledWith(outputPath, expectedJSON, 'utf-8');
    });

    test('should handle non-Error exceptions', async () => {
    const mockCSVContent = "name;age\nJohn;25";
    const inputPath = 'input.csv';
    const outputPath = 'output.json';
    const delimiter = ';';

    mockReadFile.mockResolvedValue(mockCSVContent);
    mockWriteFile.mockRejectedValue('Permission denied string error');

    await expect(formatCSVFileToJSONFile(inputPath, outputPath, delimiter))
        .rejects
        .toThrow('Failed to process CSV file: Permission denied string error');
    });

});