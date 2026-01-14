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

from senaite.core.schema.fields import BaseField
from zope.interface import implementer
from zope.schema import Dict

from .interfaces import IRuleHeaderField

DEFAULT_RULE_HEADER = {
    "id": u"",
    "title": u"",
    "description": u"",
    "color": u"",
    "applies_to": u"",
}


@implementer(IRuleHeaderField)
class RuleHeaderField(Dict, BaseField):
    """RuleHeader field
    """

    def __init__(self, **kwargs):
        default = kwargs.get("default")
        kwargs["default"] = default or DEFAULT_RULE_HEADER
        Dict.__init__(self, **kwargs)
        BaseField.__init__(self, **kwargs)
