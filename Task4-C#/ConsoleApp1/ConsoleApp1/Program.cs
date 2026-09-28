using TextToExcelDatabaseImporter.Middleware;


ImportMiddleware middleware =
    new ImportMiddleware();


await middleware.Invoke();


Console.ReadLine();