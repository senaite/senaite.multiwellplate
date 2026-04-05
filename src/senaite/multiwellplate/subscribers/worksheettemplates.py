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
from senaite.app.listing.utils import add_column
from senaite.multiwellplate import is_installed
from senaite.multiwellplate import messageFactory as _
from zope.component import adapter
from zope.interface import implementer


@adapter(IListingView)
@implementer(IListingViewAdapter)
class MultiwellPlateWorksheetTemplatesView(object):
    """Adapter for listing WorksheetTemplates view
    """

    def __init__(self, listing, context):
        self.listing = listing
        self.context = context
        self.plate_icon = get_image("plate.svg", style="width: 1.5em;")

    def before_render(self):
        if not is_installed():
            return
        states = map(lambda r: r["id"], self.listing.review_states)
        add_column(
            listing=self.listing,
            column_id="MultiwellPlate",
            column_values={
                "title": _(u"multiwellplate_plateable",
                           default=u"Plateable"),
                "sortable": False,
            },
            after="Name",
            review_states=states)

    def folder_item(self, obj, item, index):
        if not is_installed():
            return item
        enabled = api.get_object(obj).multiwell_enabled
        item["MultiwellPlate"] = self.plate_icon if enabled else ""
        return item
