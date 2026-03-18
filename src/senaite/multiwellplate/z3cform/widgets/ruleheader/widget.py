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

from z3c.form.browser.widget import HTMLFormElement
from z3c.form.converter import BaseDataConverter
from z3c.form.interfaces import IFieldWidget
from z3c.form.interfaces import IWidget
from z3c.form.widget import FieldWidget
from z3c.form.widget import Widget
from zope.component import adapter
from zope.interface import implementer
from zope.schema import Dict

from senaite.multiwellplate.interfaces import ISenaiteMultiWellPlateLayer
from senaite.multiwellplate.schema.interfaces import IRuleHeaderField
from senaite.multiwellplate.z3cform.interfaces import IRuleHeaderWidget


@adapter(IRuleHeaderField, IRuleHeaderWidget)
class RuleHeaderDataConverter(BaseDataConverter):
    """Value conversion between field and widget
    """

    def toWidgetValue(self, value):
        """Returns the field value with encoded string
        """
        if not isinstance(value, dict):
            return {}
        return value

    def toFieldValue(self, value):
        """Converts from widget value to safe_unicode
        """
        if not isinstance(value, dict):
            return {}
        return value


@implementer(IRuleHeaderWidget)
class RuleHeaderWidget(HTMLFormElement, Widget):
    """
    """
    klass = u"rule-header-widget"


@adapter(IRuleHeaderField, ISenaiteMultiWellPlateLayer)
@implementer(IFieldWidget)
def RuleHeaderWidgetFactory(field, request):
    """Widget factory for Address Widget
    """
    return FieldWidget(field, RuleHeaderWidget(request))
