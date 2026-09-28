using ClosedXML.Excel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TextToExcelDatabaseImporter.Models;

namespace TextToExcelDatabaseImporter.Services
{
    public class ExcelReaderService
    {
        public List<User> ReadUsers(string filePath)
        {
            var users = new List<User>();

            using (var workbook = new XLWorkbook(filePath))
            {
                var worksheet = workbook.Worksheet("Users");
                // since row 1 contains only the headers
                int row = 2; 

                while (!worksheet.Cell(row, 1).IsEmpty())
                {
                    var user = new User
                    {
                        Id = worksheet.Cell(row, 1).GetValue<int>(),

                        FirstName = worksheet.Cell(row, 2).GetValue<string>(),

                        LastName = worksheet.Cell(row, 3).GetValue<string>(),

                        BirthDate = worksheet.Cell(row, 4).GetValue<DateTime>(),

                        Email = worksheet.Cell(row, 5).GetValue<string>(),

                        Gender = worksheet.Cell(row, 6).GetValue<string>()
                    };


                    users.Add(user);

                    row++;
                }
            }

            return users;
        }
    }
}
