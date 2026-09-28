using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TextToExcelDatabaseImporter.Configuration
{
    public static class AppSettings
    {
        public static string TxtFilePath =
    @"C:\JSTest\Task4-C#\TxtFolder\users.txt";

        public static string ExcelFilePath =
            @"C:\JSTest\Task4-C#\ExcelFolder\Users.xlsx";
        public static string ConnectionString =
          @"Server=localhost\MSSQLSERVER01;Database=UserManagementDB;Trusted_Connection=True;TrustServerCertificate=True";
}
}
