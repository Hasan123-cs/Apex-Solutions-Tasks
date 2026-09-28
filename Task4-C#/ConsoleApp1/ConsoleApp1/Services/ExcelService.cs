using ClosedXML.Excel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TextToExcelDatabaseImporter.Models;

namespace TextToExcelDatabaseImporter.Services
{
    internal class ExcelService
    {
        public void CreateExcel(List<User> users, string filePath)
        {
            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Users");

                // headers
                worksheet.Cell(1, 1).Value = "ID";
                worksheet.Cell(1, 2).Value = "First Name";
                worksheet.Cell(1, 3).Value = "Last Name";
                worksheet.Cell(1, 4).Value = "Birth Date";
                worksheet.Cell(1, 5).Value = "Email";          
                worksheet.Cell(1, 6).Value = "Gender";


                // excel data 
                int row = 2;

                foreach (var user in users)
                {
                    worksheet.Cell(row, 1).Value = user.Id;
                    worksheet.Cell(row, 2).Value = user.FirstName;
                    worksheet.Cell(row, 3).Value = user.LastName;
                    worksheet.Cell(row, 4).Value = user.BirthDate;
                    worksheet.Cell(row, 5).Value = user.Email;
                    worksheet.Cell(row, 6).Value = user.Gender;

                    row++;
                }


                worksheet.Columns().AdjustToContents();
                string directory = Path.GetDirectoryName(filePath);

                if (!Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                workbook.SaveAs(filePath);
            }
        }
    }
}
