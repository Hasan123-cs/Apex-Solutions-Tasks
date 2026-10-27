
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Configuration;
using SmartQueue.Application.Interfaces;

namespace SmartQueue.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public SmtpEmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(
        string toEmail,
        string subject,
        string body)
    {
        var message = new MimeMessage();

        var senderEmail = _configuration["Email:Username"];
        var appPassword = _configuration["Email:AppPassword"];

        if (string.IsNullOrWhiteSpace(senderEmail) ||
            string.IsNullOrWhiteSpace(appPassword))
        {
            throw new InvalidOperationException(
                "Email settings are missing.");
        }

        message.From.Add(
            MailboxAddress.Parse(senderEmail));

        message.To.Add(
            MailboxAddress.Parse(toEmail));

        message.Subject = subject;

        message.Body = new TextPart("plain")
        {
            Text = body
        };

        using var client = new SmtpClient();

        await client.ConnectAsync(
            "smtp.gmail.com",
            587,
            SecureSocketOptions.StartTls);

        await client.AuthenticateAsync(
            senderEmail,
            appPassword);

        await client.SendAsync(message);

        await client.DisconnectAsync(true);
    }
}
