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
# Copyright 2025 by it's authors.
# Some rights reserved, see README and LICENSE.

import json

from collections import OrderedDict

from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from senaite.core.browser.worksheets.worksheet import AnalysesView
from senaite.core.browser.worksheets.worksheet import ManageResultsView
from senaite.core.interfaces import IWorksheetLayouts
from zope.interface import implements

from senaite.multiwellplate import messageFactory as _
from senaite.multiwellplate.behaviors import IPlateable
from senaite.multiwellplate.behaviors import IMultiWellPlateBehavior
from senaite.multiwellplate.utils import get_mwp_config
from senaite.multiwellplate.utils import implement_mwp_for_worksheet


class MultiWellPlateWorksheetView(AnalysesView):
    """Override worksheet classic view for adding 'well' column
    """
    def __init__(self, context, request):
        super(MultiWellPlateWorksheetView, self).__init__(context, request)
        self.multiwell_enabled = True
        if not IPlateable.providedBy(self.context):
            self.multiwell_enabled = False
            return

        self.mwp = IMultiWellPlateBehavior(self.context)

        new_columns = OrderedDict((
            ("Well", {
                "title": _(
                    u"title_well_worksheet",
                    default=u"Well"
                ),
                "sortable": False,
            }),
        ))
        self.columns.update(new_columns)

    def folderitem(self, obj, item, index):
        item = super(MultiWellPlateWorksheetView, self).folderitem(obj, item,
                                                                   index)
        if not self.multiwell_enabled:
            return item

        data = {
            "analysisUid": obj.UID,
            "wellIdx": self.mwp.getWellNumberForAnalysis(obj.UID),
        }
        template = ViewPageTemplateFile("./templates/slot_multiwellplate.pt")
        item["replace"]["Well"] = template(self, data=data)
        return item


class MultiWellPlateWorksheetLayout(object):
    implements(IWorksheetLayouts)

    def getResultLayouts(self):
        return (
            ("multiwellplate_layout_view", u"MultiWell Plate"),
        )


class AnalysesPlatingView(AnalysesView):
    """MultiWell Plate Worksheet layout
    """

    layout = ViewPageTemplateFile("templates/mwp_layout.pt")

    def __init__(self, context, request):
        super(AnalysesPlatingView, self).__init__(context, request)
        self.mwp_enabled = IPlateable.providedBy(self.context)

    def enabled(self):
        return self.mwp_enabled

    def contents_table(self, *args, **kwargs):
        """Render custom front application
        """
        return self.layout()

    def init_config_json(self):
        if not self.mwp_enabled:
            return json.dumps({})
        config = get_mwp_config(self.context)
        config["startMode"] = "container"
        return json.dumps(config)


class MwpWorksheetManageResults(ManageResultsView):
    """Overwrite parent class for implement MultiWell Plate
    """

    def __init__(self, context, request):
        super(MwpWorksheetManageResults, self).__init__(context, request)

    def __call__(self):
        implement_mwp_for_worksheet(self.context)
        return super(MwpWorksheetManageResults, self).__call__()
