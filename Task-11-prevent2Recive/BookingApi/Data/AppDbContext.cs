
using BookingApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BookingApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(
            DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Booking> Bookings => Set<Booking>();

        protected override void OnModelCreating(
            ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasKey(b => b.Id);

                entity.Property(b => b.UserId)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.HasIndex(b => new
                {
                    b.RoomId,
                    b.BookingDate
                })
                    .IsUnique()
                    .HasDatabaseName(
                        "IX_Bookings_RoomId_BookingDate");
            });
        }
    }
}
