const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
import nodemailer from 'npm:nodemailer@6.9.16'

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

    const password = Deno.env.get('GMAIL_APP_PASSWORD')
    if (!password) {
      throw new Error('GMAIL_APP_PASSWORD not configured')
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: GMAIL_USER,
        pass: password,
      },
    })

    const html = buildEmailHtml({ processNumber, itemName, quantity, destination, currentStatus, action, userName, sector, notes, agreement })
    const subject = `[TrackFlow] ${STATUS_LABELS[currentStatus] || currentStatus} - Processo ${processNumber}`

    const responsibleSector = STATUS_SECTOR_MAP[currentStatus] || sector
    const recipientEmail = SECTOR_EMAILS[responsibleSector]

    const recipients = new Set<string>()
    if (recipientEmail) recipients.add(recipientEmail)
    if (ADMIN_EMAIL) recipients.add(ADMIN_EMAIL)

    for (const to of recipients) {
      await transporter.sendMail({
        from: `TrackFlow <${GMAIL_USER}>`,
        to,
        subject,
        html,
      })
      console.log(`Email sent to ${to}`)
    }

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
