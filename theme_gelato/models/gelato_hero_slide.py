from odoo import fields, models


class GelatoHeroSlide(models.Model):
    _name = 'gelato.hero.slide'
    _description = 'Gelato Hero Slide'
    _order = 'sequence, id'

    name = fields.Char(string='Badge', required=True, translate=True)
    headline = fields.Char(string='Headline', required=True, translate=True)
    headline_accent = fields.Char(string='Headline accent', translate=True,
                                  help='Highlighted part of headline')
    subtitle = fields.Text(string='Subtitle', translate=True)
    button_text = fields.Char(string='Button text', translate=True)
    button_url = fields.Char(string='Button URL', default='#')
    image = fields.Image(string='Background image', max_width=1920, max_height=1080)
    sequence = fields.Integer(string='Sequence', default=10)
    active = fields.Boolean(default=True)
    website_id = fields.Many2one('website', string='Website', ondelete='cascade')
