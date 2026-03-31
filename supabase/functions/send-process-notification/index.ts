import { corsHeaders } from '@supabase/supabase-js/cors'

const GMAIL_USER = 'sistema.processos.cj@uenp.edu.br'

const SECTOR_EMAILS: Record<string, string> = {
  'Planejamento': 'planejamento.cj@uenp.edu.br',
  'Almoxarifado': 'almoxarifado.cj@uenp.edu.br',
  'NTI': 'nti.cj@uenp.edu.br',
  'Patrimônio': 'patrimonio.cj@uenp.edu.br',
}

const ADMIN_EMAIL = 'planejamento.cj@uenp.edu.br'

const STATUS_LABELS: Record<string, string> = {
  aguardando_recebimento: 'Aguardando Recebimento',
  recebido_almoxarifado: 'Recebido no Almoxarifado',
  conferencia_nti: 'Conferência NTI',
  conferencia_almoxarifado: 'Conferência Almoxarifado',
  de_acordo: 'De Acordo',
  em_desacordo: 'Em Desacordo',
  pendencia_fornecedor: 'Pendência com Fornecedor',
  patrimonio: 'Patrimônio',
  entregue: 'Entregue ao Destino Final',
}

const STATUS_SECTOR_MAP: Record<string, string> = {
  aguardando_recebimento: 'Almoxarifado',
  recebido_almoxarifado: 'Almoxarifado',
  conferencia_nti: 'NTI',
  conferencia_almoxarifado: 'Almoxarifado',
  de_acordo: 'Almoxarifado',
  em_desacordo: 'Almoxarifado',
  pendencia_fornecedor: 'Almoxarifado',
  patrimonio: 'Patrimônio',
  entregue: 'Concluído',
}

async function sendEmail(to: string, subject: string, html: string) {
  const password = Deno.env.get('GMAIL_APP_PASSWORD')
  if (!password) {
    console.error('GMAIL_APP_PASSWORD not set')
    return
  }

  // Use Gmail SMTP via a fetch to a simple SMTP relay approach
  // Since Deno edge functions can't do raw SMTP, we use the Gmail API via OAuth or 
  // a simpler approach: use nodemailer-compatible SMTP via a raw TCP connection
  // Instead, let's use the Gmail SMTP with base64 encoded credentials

  const encoder = new TextEncoder()
  
  const boundary = `----=_Part_${crypto.randomUUID()}`
  
  const emailRaw = [
    `From: TrackFlow <${GMAIL_USER}>`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    btoa(unescape(encodeURIComponent(html))),
  ].join('\r\n')

  // Use Gmail API with App Password via SMTP
  // Since direct SMTP isn't available in Deno Deploy, we'll use a workaround
  // by connecting to smtp.gmail.com via Deno.connect (TCP)
  
  try {
    const conn = await Deno.connect({ hostname: 'smtp.gmail.com', port: 465 })
    // For SSL/TLS we need startTls
    const tlsConn = await Deno.connectTls({ hostname: 'smtp.gmail.com', port: 465 })
    
    const read = async (): Promise<string> => {
      const buf = new Uint8Array(1024)
      const n = await tlsConn.read(buf)
      return new TextDecoder().decode(buf.subarray(0, n || 0))
    }
    
    const write = async (data: string) => {
      await tlsConn.write(encoder.encode(data + '\r\n'))
    }

    await read() // greeting
    await write(`EHLO localhost`)
    await read()
    
    // AUTH LOGIN
    await write(`AUTH LOGIN`)
    await read()
    await write(btoa(GMAIL_USER))
    await read()
    await write(btoa(password))
    await read()
    
    // MAIL FROM
    await write(`MAIL FROM:<${GMAIL_USER}>`)
    await read()
    
    // RCPT TO
    await write(`RCPT TO:<${to}>`)
    await read()
    
    // DATA
    await write(`DATA`)
    await read()
    await write(emailRaw + '\r\n.')
    await read()
    
    await write(`QUIT`)
    tlsConn.close()
    
    console.log(`Email sent to ${to}`)
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err)
  }
}

function buildEmailHtml(data: {
  processNumber: string
  itemName: string
  quantity: number
  destination: string
  currentStatus: string
  action: string
  userName: string
  sector: string
  notes?: string
  agreement?: string
}): string {
  const statusLabel = STATUS_LABELS[data.currentStatus] || data.currentStatus
  
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f6f9; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: #1e40af; color: #fff; padding: 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 22px;">TrackFlow - Movimentação de Processo</h1>
    </div>
    <div style="padding: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Processo:</td><td style="padding: 8px 0; color: #1f2937;">${data.processNumber}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Item:</td><td style="padding: 8px 0; color: #1f2937;">${data.itemName}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Quantidade:</td><td style="padding: 8px 0; color: #1f2937;">${data.quantity}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Destino:</td><td style="padding: 8px 0; color: #1f2937;">${data.destination}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Status Atual:</td><td style="padding: 8px 0; color: #1e40af; font-weight: bold;">${statusLabel}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Ação:</td><td style="padding: 8px 0; color: #1f2937;">${data.action}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Realizado por:</td><td style="padding: 8px 0; color: #1f2937;">${data.userName} (${data.sector})</td></tr>
        ${data.notes ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Observação:</td><td style="padding: 8px 0; color: #1f2937;">${data.notes}</td></tr>` : ''}
        ${data.agreement ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Parecer:</td><td style="padding: 8px 0; color: ${data.agreement === 'de_acordo' ? '#16a34a' : '#dc2626'}; font-weight: bold;">${data.agreement === 'de_acordo' ? 'De Acordo' : 'Em Desacordo'}</td></tr>` : ''}
      </table>
    </div>
    <div style="background: #f9fafb; padding: 16px; text-align: center; color: #6b7280; font-size: 12px;">
      Este é um e-mail automático do sistema TrackFlow. Não responda este e-mail.
    </div>
  </div>
</body>
</html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { processNumber, itemName, quantity, destination, currentStatus, action, userName, sector, notes, agreement } = body

    const html = buildEmailHtml({ processNumber, itemName, quantity, destination, currentStatus, action, userName, sector, notes, agreement })
    const subject = `[TrackFlow] ${STATUS_LABELS[currentStatus] || currentStatus} - Processo ${processNumber}`

    // Determine recipient sector based on current status
    const responsibleSector = STATUS_SECTOR_MAP[currentStatus] || sector
    const recipientEmail = SECTOR_EMAILS[responsibleSector]

    const emailPromises: Promise<void>[] = []

    // Send to responsible sector
    if (recipientEmail) {
      emailPromises.push(sendEmail(recipientEmail, subject, html))
    }

    // Always send to admin (if not the same as sector email)
    if (ADMIN_EMAIL && ADMIN_EMAIL !== recipientEmail) {
      emailPromises.push(sendEmail(ADMIN_EMAIL, subject, html))
    }

    await Promise.all(emailPromises)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Notification error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
