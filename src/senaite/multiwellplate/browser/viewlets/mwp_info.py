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

from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from plone.app.layout.viewlets import ViewletBase

from senaite.multiwellplate.behaviors import IPlateable
from senaite.multiwellplate.behaviors import IMultiWellPlateBehavior


class MwpInfoMessage(ViewletBase):
    """Viewlet of base structure for front application
    """
    template = ViewPageTemplateFile("templates/mwp-info.pt")

    def __init__(self, context, request, view, manager=None):
        super(MwpInfoMessage, self).__init__(
            context, request, view, manager=None)
        self.mwp_enabled = IPlateable.providedBy(self.context)
        if self.mwp_enabled:
            self.mwp = IMultiWellPlateBehavior(self.context)

    def render(self):
        if not self.show():
            return ""
        return self.template()

    def show(self):
        # XXX: Hack to show the viewlet only on the WS add_analyses view
        if not self.request.getURL().endswith("add_analyses"):
            return False
        return self.mwp_enabled

    def getNumberOfWells(self):
        if self.mwp_enabled:
            cols = self.mwp.getColsCount()
            rows = self.mwp.getRowsCount()
            return cols * rows
        return 0

    def getAssignedAnalyses(self):
        return len(self.context.getRawAnalyses())
