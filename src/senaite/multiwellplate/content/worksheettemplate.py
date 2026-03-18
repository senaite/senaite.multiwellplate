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

from plone.supermodel.model import Fieldset
from plone.supermodel.interfaces import FIELDSETS_KEY
from plone.supermodel.interfaces import ISchema
from plone.supermodel.interfaces import ISchemaPlugin
from plone.supermodel.utils import syncSchema
from senaite.core.content.worksheettemplate import IWorksheetTemplateSchema
from zope.schema import getFieldsInOrder
from zope.component import adapter
from zope.interface import implementer

from senaite.multiwellplate import is_installed
from senaite.multiwellplate import messageFactory as _
from senaite.multiwellplate.schema import MultiWellPlateConfigSchema


@implementer(ISchemaPlugin)
@adapter(ISchema)
class MultiWellPlateWorksheetTemplateExtender(object):
    """Extend WorksheetTemplate schema for implement MultiWell Plate config
    """

    order = 999999

    def __init__(self, schema):
        self.schema = schema

    def __call__(self):
        if self.schema.getName() == IWorksheetTemplateSchema.__name__:
            syncSchema(MultiWellPlateConfigSchema, self.schema)
            fieldsets = self.get_fieldsets()
            self.schema.setTaggedValue(FIELDSETS_KEY, fieldsets)

    def get_fieldsets(self):
        fieldsets = self.schema.getTaggedValue(FIELDSETS_KEY)
        fields = [k for k, v in getFieldsInOrder(MultiWellPlateConfigSchema)]
        fieldsets.append(Fieldset(
            "multiwellplate",
            label=_(
                u"label_fieldset_multiwellplate",
                default=u"MultiWell Plate"
            ),
            fields=fields,
        ))
        return fieldsets
