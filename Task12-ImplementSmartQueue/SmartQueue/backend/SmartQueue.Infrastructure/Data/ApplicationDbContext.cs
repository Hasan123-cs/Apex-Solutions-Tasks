
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SmartQueue.Domain.Entities;
using SmartQueue.Infrastructure.Identity;

namespace SmartQueue.Infrastructure.Data;

public class ApplicationDbContext
    : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // Domain tables
    public DbSet<Service> Services => Set<Service>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<StaffSchedule> StaffSchedules => Set<StaffSchedule>();
    public DbSet<WeeklyInterval> WeeklyIntervals => Set<WeeklyInterval>();
    public DbSet<StaffDayOff> StaffDaysOff => Set<StaffDayOff>();
    public DbSet<StaffScheduleService> StaffScheduleServices => Set<StaffScheduleService>();
    public DbSet<QueueEntry> QueueEntries => Set<QueueEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // SERVICES
        modelBuilder.Entity<Service>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(x => x.Price)
                .HasPrecision(18, 2);

            entity.HasIndex(x => x.Name);

            entity.ToTable(t =>
            {
                t.HasCheckConstraint(
                    "CK_Services_Price",
                    "[Price] >= 0");

                t.HasCheckConstraint(
                    "CK_Services_Duration",
                    "[Duration] > 0");
            });
        });

        // APPOINTMENTS
        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Reference)
                .IsRequired()
                .HasMaxLength(50);

            entity.HasIndex(x => x.Reference)
                .IsUnique();

            entity.HasIndex(x => new { x.StaffId, x.Start });

            entity.HasOne(x => x.Service)
                .WithMany(x => x.Appointments)
                .HasForeignKey(x => x.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne<ApplicationUser>()
                .WithMany(x => x.CustomerAppointments)
                .HasForeignKey(x => x.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne<ApplicationUser>()
                .WithMany(x => x.StaffAppointments)
                .HasForeignKey(x => x.StaffId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.ToTable(t =>
                t.HasCheckConstraint(
                    "CK_Appointments_Time",
                    "[End] > [Start]"));
        });

        // STAFF SCHEDULES
        modelBuilder.Entity<StaffSchedule>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.HasIndex(x => x.StaffId)
                .IsUnique();

            entity.HasOne<ApplicationUser>()
                .WithOne(x => x.StaffSchedule)
                .HasForeignKey<StaffSchedule>(x => x.StaffId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // WEEKLY INTERVALS
        modelBuilder.Entity<WeeklyInterval>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.HasOne(x => x.StaffSchedule)
                .WithMany(x => x.WeeklyIntervals)
                .HasForeignKey(x => x.StaffScheduleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.ToTable(t =>
                t.HasCheckConstraint(
                    "CK_WeeklyIntervals_Time",
                    "[To] > [From]"));
        });

        // STAFF DAYS OFF
        modelBuilder.Entity<StaffDayOff>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.HasIndex(x => new
            {
                x.StaffScheduleId,
                x.Date
            }).IsUnique();

            entity.HasOne(x => x.StaffSchedule)
                .WithMany(x => x.DaysOff)
                .HasForeignKey(x => x.StaffScheduleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // STAFF SERVICES (MANY-TO-MANY)
        modelBuilder.Entity<StaffScheduleService>(entity =>
        {
            entity.HasKey(x => new
            {
                x.StaffScheduleId,
                x.ServiceId
            });

            entity.HasOne(x => x.StaffSchedule)
                .WithMany(x => x.StaffScheduleServices)
                .HasForeignKey(x => x.StaffScheduleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Service)
                .WithMany(x => x.StaffScheduleServices)
                .HasForeignKey(x => x.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // QUEUE ENTRIES
        modelBuilder.Entity<QueueEntry>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.HasIndex(x => new
            {
                x.QueueDate,
                x.QueueNumber
            }).IsUnique();

            entity.HasIndex(x => x.AppointmentId)
                .IsUnique();

            entity.HasOne(x => x.Appointment)
                .WithOne(x => x.QueueEntry)
                .HasForeignKey<QueueEntry>(x => x.AppointmentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.ToTable(t =>
                t.HasCheckConstraint(
                    "CK_QueueEntries_Number",
                    "[QueueNumber] > 0"));
        });
    }
}
