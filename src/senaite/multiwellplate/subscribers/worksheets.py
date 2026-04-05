# -*- coding: utf-8 -*-
#
# This file is part of SENAITE.MULTIWELLPLATE.
#
# SENAITE.MULTIWELLPLATE is free software: you can redistribute it and/or
# modify it under the terms of the GNU General Public License as published
# by the Free Software Foundation, version 2.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
# details.
#
# You should have received a copy of the GNU General Public License along with
# this program; if not, write to the Free Software Foundation, Inc., 51
# Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
#
# Copyright 2026 by it's authors.
# Some rights reserved, see README and LICENSE.

from bika.lims import api
from bika.lims.utils import get_image
from senaite.app.listing.interfaces import IListingView
from senaite.app.listing.interfaces import IListingViewAdapter
from senaite.multiwellplate import is_installed
from senaite.multiwellplate.behaviors import IPlateable
from zope.component import adapter
from zope.interface import implementer


@adapter(IListingView)
@implementer(IListingViewAdapter)
class MultiwellPlateWorksheetsView(object):
    """Adapter for listing worksheets
    """

    def __init__(self, listing, context):
        self.listing = listing
        self.context = context
        self.plate_icon = get_image("plate.svg", style="width: 1.5em;")
        self.empty_block = "<div style=\"width: 1.6em;\"></div>"

    def before_render(self):
        return

    def folder_item(self, obj, item, index):
        if not is_installed():
            return item
        worksheet = api.get_object(obj)
        if IPlateable.providedBy(worksheet):
            add_before = self.plate_icon
        else:
            add_before = self.empty_block
        item["before"]["getWorksheetTemplateTitle"] = add_before
        return item
