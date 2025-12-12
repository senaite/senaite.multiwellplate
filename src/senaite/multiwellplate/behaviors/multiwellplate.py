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

from AccessControl import ClassSecurityInfo
from Products.CMFCore import permissions
from bika.lims import api
from plone.supermodel import model
from senaite.core.behaviors.utils import get_behavior_schema
from senaite.core.schema.fields import DataGridRow
from zope import schema
from zope.interface import Interface
from zope.interface import implementer

from senaite.multiwellplate import messageFactory as _
from senaite.multiwellplate.schema import MultiWellPlateConfigSchema


class IPlateable(Interface):
    """Explicit marker interface for MultiWell Plate
    """
    pass


class IMultiWellRecord(Interface):
    """
    """
    analysis_uid = schema.TextLine(
        title=_(
            u"multiwellplate_analysis_uid_title",
            default=u"Analysis UID"
        ),
        required=True,
    )

    well_number = schema.Int(
        title=_(
            u"multiwellplate_well_number_title",
            default=u"Well number"
        ),
        required=True,
    )


class IMultiWellPlateBehavior(MultiWellPlateConfigSchema):
    """
    """

    multiwellplate = schema.List(
        title=_(
            u"multiwellplate_title",
            default=u"MultiWell Plate"
        ),
        value_type=DataGridRow(schema=IMultiWellRecord),
        default=[],
    )


@implementer(IMultiWellPlateBehavior)
class MultiWellPlateFactory(object):
    """Factory that provides the extended MultiWellPlate field
    """
    security = ClassSecurityInfo()

    def __init__(self, context):
        self.context = context

    @security.private
    def accessor(self, fieldname, raw=False):
        """Return the field accessor for the fieldname
        """
        fields = api.get_fields(self.context)
        field = fields.get(fieldname, None)
        if not field:
            return None
        if raw:
            if hasattr(field, "get_raw"):
                return field.get_raw
            return field.getRaw
        return field.get

    @security.private
    def mutator(self, fieldname):
        """Return the field mutator for the fieldname
        """
        fields = api.get_fields(self.context)
        field = fields.get(fieldname, None)
        if not field:
            return None
        return field.set

    @security.protected(permissions.View)
    def getColsCount(self):
        accessor = self.accessor("cols_count")
        return accessor(self.context)

    @security.protected(permissions.ModifyPortalContent)
    def setColsCount(self, value):
        mutator = self.mutator("cols_count")
        mutator(self.context, int(value))

    @security.protected(permissions.View)
    def getRowsCount(self):
        accessor = self.accessor("rows_count")
        return accessor(self.context)

    @security.protected(permissions.ModifyPortalContent)
    def setRowsCount(self, value):
        mutator = self.mutator("rows_count")
        mutator(self.context, int(value))

    @security.protected(permissions.View)
    def getFields(self):
        accessor = self.accessor("fields")
        return accessor(self.context)

    @security.protected(permissions.ModifyPortalContent)
    def setFields(self, value):
        mutator = self.mutator("fields")
        mutator(self.context, value)

    @security.protected(permissions.View)
    def getRules(self):
        accessor = self.accessor("rules")
        return accessor(self.context)

    @security.protected(permissions.ModifyPortalContent)
    def setRules(self, value):
        mutator = self.mutator("rules")
        mutator(self.context, value)

    @security.protected(permissions.View)
    def getMultiWellPlate(self):
        accessor = self.accessor("multiwellplate")
        return accessor(self.context) or []

    @security.protected(permissions.ModifyPortalContent)
    def setMultiWellPlate(self, value):
        if not isinstance(value, list):
            value = [value]
        mutator = self.mutator("multiwellplate")
        mutator(self.context, value)

    def getWellNumberForAnalysis(self, analysis):
        plate = self.getMultiWellPlate()
        uid = api.get_uid(analysis)
        well = [w for w in plate if w["analysis_uid"] == uid]
        if not well:
            return None
        if len(well) > 1:
            return None
        return well[0]["well_number"]
