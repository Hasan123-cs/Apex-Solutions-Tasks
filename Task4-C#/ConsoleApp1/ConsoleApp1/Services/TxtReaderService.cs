using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TextToExcelDatabaseImporter.Models;

namespace TextToExcelDatabaseImporter.Services
{
    internal class TxtReaderService
    {
        public List<User> ReadUsers(string filePath)
        {
            var users = new List<User>();

            var lines = File.ReadAllLines(filePath);

            foreach (var line in lines)
            {
                var data = line.Split(',');

                var user = new User
                {
                    Id = int.Parse(data[0]),
                    FirstName = data[1],
                    LastName = data[2],
                    BirthDate = DateTime.Parse(data[3]),
                    Email = data[4],
                    Gender = data[5]
                };

                users.Add(user);
            }

            return users;
        }
    }
}
