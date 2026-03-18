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

from senaite.core.browser.form.adapters.worksheettemplate import \
    EditForm as BaseEditForm

READONLY_FIELDS_FORMAT = "form.widgets.fields.{}.widgets.{}"
READONLY_FIELDS_LIST = ["keyword", "title", "value"]


class EditForm(BaseEditForm):
    """Edit form adapter for DX WorksheetTemplate
    """

    def initialized(self, data):
        super(EditForm, self).initialized(data)
        self.set_readonly_fields()
        return self.data

    def modified(self, data):
        super(EditForm, self).modified(data)
        return self.data

    def added(self, data):
        super(EditForm, self).added(data)
        return self.data

    def set_readonly_fields(self):
        for column in READONLY_FIELDS_LIST:
            for idx in range(6):
                field_name = READONLY_FIELDS_FORMAT.format(idx, column)
                self.add_readonly_field(field_name)
