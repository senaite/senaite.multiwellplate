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

from z3c.form.interfaces import IWidget


class IHiddenWidget(IWidget):
    """HiddenField view widget
    """
    pass


class IRuleHeaderWidget(IWidget):
    """RuleHeader view widget
    """
    pass


class IMultiSelectWidget(IWidget):
    """MultiSelect view widget — dropdown with checkboxes
    """
    pass
