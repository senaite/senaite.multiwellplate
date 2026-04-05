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

import os

from senaite.core.browser.globals.interfaces import IIconProvider
from senaite.core.browser.globals.interfaces import ISenaiteTheme
from plone.resource.interfaces import IResourceDirectory
from zope.component import adapter
from zope.component import getUtility
from zope.interface import implementer

ICON_BASE_URL = "++plone++senaite.multiwellplate.static/images"


@adapter(ISenaiteTheme)
@implementer(IIconProvider)
class MultiwellPlateIconProvider(object):

    def __init__(self, view, context):
        self.view = view
        self.context = context

    def icons(self):
        icons = {}
        static_dir = getUtility(
            IResourceDirectory, name=u"++plone++senaite.multiwellplate.static")
        icon_dir = static_dir["images"]
        for icon in icon_dir.listDirectory():
            name, ext = os.path.splitext(icon)
            icons[name] = "{}/{}".format(ICON_BASE_URL, icon)
            icons[icon] = "{}/{}".format(ICON_BASE_URL, icon)
        return icons
