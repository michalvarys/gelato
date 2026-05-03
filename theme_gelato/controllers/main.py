import logging
import werkzeug

from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)


class GelatoController(http.Controller):

    @http.route('/theme_gelato/hero_slides', type='json', auth='public', website=True)
    def get_hero_slides(self):
        website = request.website
        domain = [
            ('active', '=', True),
            '|', ('website_id', '=', False), ('website_id', '=', website.id),
        ]
        slides = request.env['gelato.hero.slide'].sudo().search(domain, order='sequence, id')
        return [{
            'id': s.id,
            'name': s.name,
            'headline': s.headline,
            'headline_accent': s.headline_accent or '',
            'subtitle': s.subtitle or '',
            'button_text': s.button_text or '',
            'button_url': s.button_url or '#',
            'image_url': f'/web/image/gelato.hero.slide/{s.id}/image' if s.image else '',
        } for s in slides]

    @http.route('/gelato/contact', type='http', auth='public', website=True,
                methods=['POST'], csrf=True)
    def contact_form(self, **kwargs):
        name = kwargs.get('name', '').strip()
        email = kwargs.get('email', '').strip()
        phone = kwargs.get('phone', '').strip()
        event_type = kwargs.get('event-type', '').strip()
        date = kwargs.get('date', '').strip()
        guests = kwargs.get('guests', '').strip()
        message = kwargs.get('message', '').strip()

        if not name or not email:
            return werkzeug.utils.redirect('/?form=error#poptavka')

        company = request.env['res.company'].sudo().browse(
            request.env.company.id
        )
        recipient = company.email or 'info@gelato-kv.cz'

        body = f"""
<h3>Nová poptávka z webu Gelato!</h3>
<table style="border-collapse:collapse;width:100%;max-width:600px;">
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Jméno</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">{name}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">E-mail</td>
        <td style="padding:8px;border-bottom:1px solid #eee;"><a href="mailto:{email}">{email}</a></td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Telefon</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">{phone or '–'}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Typ akce</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">{event_type or '–'}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Termín</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">{date or '–'}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Počet hostů</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">{guests or '–'}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Zpráva</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">{message or '–'}</td></tr>
</table>
"""
        try:
            request.env['mail.mail'].sudo().create({
                'subject': f'Poptávka catering – {name}',
                'body_html': body,
                'email_from': email,
                'email_to': recipient,
                'auto_delete': True,
            }).send()
        except Exception:
            _logger.exception("Failed to send gelato contact form email")
            return werkzeug.utils.redirect('/?form=error#poptavka')

        return werkzeug.utils.redirect('/?form=ok#poptavka')

    @http.route('/theme_gelato/gallery_images', type='json', auth='public', website=True)
    def get_gallery_images(self):
        website = request.website
        domain = [
            ('active', '=', True),
            '|', ('website_id', '=', False), ('website_id', '=', website.id),
        ]
        images = request.env['gelato.gallery.image'].sudo().search(domain, order='sequence, id')
        return [{
            'id': img.id,
            'name': img.name,
            'image_url': f'/web/image/gelato.gallery.image/{img.id}/image' if img.image else '',
        } for img in images]
