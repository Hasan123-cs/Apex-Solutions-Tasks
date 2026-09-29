using Microsoft.EntityFrameworkCore;
using SignalRCounter.Models;

namespace SignalRCounter.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(
    DbContextOptions<AppDbContext> options
    )
    : base(options)
        {

        }


        public DbSet<User> Users { get; set; }
    }

}
