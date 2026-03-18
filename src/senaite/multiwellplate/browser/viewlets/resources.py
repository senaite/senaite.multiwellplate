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

import json

from bika.lims import api
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from plone.app.layout.viewlets import ViewletBase

from senaite.multiwellplate.behaviors import IPlateable
from senaite.multiwellplate.utils import get_mwp_config


class FrontApplication(ViewletBase):
    """Viewlet of base structure for front application
    """
    template = ViewPageTemplateFile("templates/front-app.pt")

    def __init__(self, context, request, view, manager=None):
        super(FrontApplication, self).__init__(
            context, request, view, manager=None)
        current_layout = self.context.getResultsLayout()
        self.mwp_enabled = IPlateable.providedBy(self.context)
        self.mwp_layout = current_layout == "multiwellplate_layout_view"

    def index(self):
        return self.template()

    def enabled(self):
        return self.mwp_enabled and not self.mwp_layout

    def init_config_json(self):
        if not self.mwp_enabled:
            return json.dumps({})
        config = get_mwp_config(self.context)
        return json.dumps(config)
