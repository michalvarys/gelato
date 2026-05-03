#!/usr/bin/env python3
"""
Resolve t-call directives in the page_home view by inlining each snippet's
<section> content directly into the page's arch_db.
This allows the Odoo editor to recognize #wrap as an editable drop zone.
"""
import json

page_view = env['ir.ui.view'].search([('key', '=', 'theme_gelato.page_home')])
if not page_view:
    print("ERROR: page_home view not found")
    exit()

snippet_keys = [
    'theme_gelato.s_gelato_hero',
    'theme_gelato.s_gelato_why',
    'theme_gelato.s_gelato_gallery',
    'theme_gelato.s_gelato_reviews',
    'theme_gelato.s_gelato_location',
    'theme_gelato.s_gelato_map',
    'theme_gelato.s_gelato_inquiry',
    'theme_gelato.s_gelato_cta',
]

from lxml import etree

sections_html = []
for key in snippet_keys:
    view = env['ir.ui.view'].search([('key', '=', key)])
    if not view:
        print(f"WARNING: {key} not found")
        continue

    arch_str = view.arch_db
    if isinstance(arch_str, dict):
        arch_str = arch_str.get('en_US', '')

    # Parse the template XML and extract the <section> element
    try:
        tree = etree.fromstring(arch_str.encode('utf-8'))
    except Exception:
        # Try wrapping in root
        tree = etree.fromstring(f'<root>{arch_str}</root>'.encode('utf-8'))

    section = tree.find('.//section')
    if section is not None:
        section_str = etree.tostring(section, encoding='unicode', pretty_print=True)
        sections_html.append(section_str.strip())
        print(f"OK: {key} - extracted section")
    else:
        print(f"WARNING: {key} - no <section> found")

# Build the new arch with inline content
new_arch = '<t name="Gelato Home" t-name="theme_gelato.page_home">\n'
new_arch += '    <t t-call="website.layout">\n'
new_arch += '        <t t-set="additional_title">Gelato! - Italské gelato v Karlových Varech</t>\n'
new_arch += '        <div id="wrap" class="oe_structure theme_gelato_page">\n'
for s in sections_html:
    # Indent each line of the section
    for line in s.split('\n'):
        new_arch += '            ' + line + '\n'
new_arch += '        </div>\n'
new_arch += '    </t>\n'
new_arch += '</t>'

# Update the view
page_view.arch_db = new_arch
env.cr.commit()
print(f"\nSUCCESS: Updated page_home view (id={page_view.id}) with inline content")
print(f"New arch length: {len(new_arch)} chars")
