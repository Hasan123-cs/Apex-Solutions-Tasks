using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TextToExcelDatabaseImporter.Data;
using TextToExcelDatabaseImporter.Models;

namespace TextToExcelDatabaseImporter.Services
{
    public class DatabaseService
    {
        private readonly AppDbContext _context;


        public DatabaseService(AppDbContext context)
        {
            _context = context;
        }
        public async Task SaveUsers(List<User> users)
        {
            // Create database and table if not exist
            _context.Database.EnsureCreated();
            foreach (var user in users)
            {
                bool exists = await _context.Users.AnyAsync(u => u.Email == user.Email);


                if (!exists)
                {
                    var newUser = new User
                    {
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        BirthDate = user.BirthDate,
                        Email = user.Email,
                        Gender = user.Gender
                    };

                    _context.Users.Add(newUser);
                }
            }
            await _context.SaveChangesAsync();
        }
    }
}
