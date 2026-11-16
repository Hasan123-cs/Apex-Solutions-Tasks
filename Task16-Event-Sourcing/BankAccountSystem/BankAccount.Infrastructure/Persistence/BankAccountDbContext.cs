using BankAccount.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace BankAccount.Infrastructure.Persistence;

public class BankAccountDbContext : DbContext
{
    public BankAccountDbContext(
        DbContextOptions<BankAccountDbContext> options)
        : base(options)
    {
    }

    public DbSet<StoredEvent> Events => Set<StoredEvent>();

    public DbSet<AccountBalanceReadModel> AccountBalances
        => Set<AccountBalanceReadModel>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<StoredEvent>(entity =>
        {
            entity.ToTable("Events");

            entity.HasKey(e => e.Id);

            entity.HasIndex(e => new
            {
                e.AccountId,
                e.Version
            }).IsUnique();

            entity.Property(e => e.EventData)
                .HasColumnType("jsonb");
        });

        modelBuilder.Entity<AccountBalanceReadModel>(entity =>
        {
            entity.ToTable("AccountBalances");

            entity.HasKey(e => e.AccountId);

            entity.Property(e => e.Balance)
                .HasPrecision(18, 2);
        });
    }
}