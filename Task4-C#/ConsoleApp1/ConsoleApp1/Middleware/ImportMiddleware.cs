using Microsoft.EntityFrameworkCore;
using TextToExcelDatabaseImporter.Configuration;
using TextToExcelDatabaseImporter.Data;
using TextToExcelDatabaseImporter.Services;

namespace TextToExcelDatabaseImporter.Middleware
{
    public class ImportMiddleware
    {
        public async Task Invoke()
        {
            // 1
            TxtReaderService txtReader = new TxtReaderService();
            var usersFromTxt =
                txtReader.ReadUsers(
                    AppSettings.TxtFilePath
                );
            Console.WriteLine(
                "TXT file read successfully."
            );
            // 2 
            ExcelService excelService =
                new ExcelService();


            excelService.CreateExcel(
                usersFromTxt,
                AppSettings.ExcelFilePath
            );


            Console.WriteLine(
                "Excel created successfully."
            );



            // 3

            Console.WriteLine(
                "Waiting 5 seconds before saving to database..."
            );


            await Task.Delay(5000);



            // 4

            ExcelReaderService excelReader =
                new ExcelReaderService();


            var usersFromExcel =
                excelReader.ReadUsers(
                    AppSettings.ExcelFilePath
                );


            Console.WriteLine(
                "Excel read successfully."
            );



            // 5

            var options =
                new DbContextOptionsBuilder<AppDbContext>()
                .UseSqlServer(
                    AppSettings.ConnectionString
                )
                .Options;



            using var context =
                new AppDbContext(options);



            // 6

            DatabaseService databaseService =
                new DatabaseService(context);


            await databaseService.SaveUsers(
                usersFromExcel
            );


            Console.WriteLine(
                "Users saved to database."
            );
        }
    }
}