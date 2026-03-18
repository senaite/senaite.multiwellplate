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

from plone.autoform import directives
from senaite.core.schema.fields import DataGridField
from senaite.core.schema.fields import DataGridRow
from zope import schema
from zope.interface import Interface
from zope.interface import implementer

from .interfaces import IRecordFields
from senaite.multiwellplate import messageFactory as _
from senaite.multiwellplate.vocabularies.displaymodes import DisplayModesVocabularyFactory


class IRecordField(Interface):
    """Schema for field
    """

    directives.widget("keyword", style=u"width: 150px!important;")
    keyword = schema.TextLine(
        title=_(
            u"label_field_keyword",
            default=u"Keyword"
        ),
        required=True,
        default=u""
    )

    directives.widget("title", style=u"width: 150px!important;")
    title = schema.TextLine(
        title=_(
            u"label_interim_title",
            default=u"Field title"
        ),
        required=True,
        default=u""
    )

    directives.widget("value", style=u"width: 150px!important;")
    value = schema.TextLine(
        title=_(
            u"label_field_value",
            default=u"Value"
        ),
        required=True,
        default=u""
    )

    display_mode = schema.Choice(
        title=_(
            u"label_displaye_mode",
            default=u"Display mode"
        ),
        source="senaite.multiwellplate.vocabularies.displaymodes",
        default="title",
        required=True,
    )

    directives.widget("filter_by", klass="hide-title")
    filterable = schema.Bool(
        title=_(
            u"label_field_filter",
            default=u"Filter By"
        ),
        required=False,
        default=False
    )

    directives.widget("sort_by", klass="hide-title")
    sortable = schema.Bool(
        title=_(
            u"label_field_sort",
            default=u"Sort By"
        ),
        required=False,
        default=False
    )

    directives.widget("group_by", klass="hide-title")
    groupable = schema.Bool(
        title=_(
            u"label_field_group",
            default=u"Group by"
        ),
        required=False,
        default=True
    )


@implementer(IRecordFields)
class RecordFields(DataGridField):

    value_type = DataGridRow(schema=IRecordField)

    def __init__(self, **kwargs):
        default = kwargs.get("default")
        kwargs["default"] = default or []
        super(RecordFields, self).__init__(**kwargs)

    def set(self, object, val):
        # replace None values with empty string
        val = [{k: "" if v is None else v for k, v in i.items()} for i in val]
        super(DataGridField, self).set(object, val)

    def get(self, object):
        # https://github.com/senaite/senaite.core/pull/2600
        # currently, all values are returned as unicodes.
        # Shall we convert them to strings?
        # Or use ASCIIField instead of TextLine?
        value = super(DataGridField, self).get(object)
        return value
