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

from plone.autoform import directives
from plone.supermodel import model
from senaite.core.schema.fields import DataGridField
from senaite.core.schema.fields import DataGridRow
from senaite.core.z3cform.widgets.datagrid import DataGridWidgetFactory
from senaite.core.z3cform.widgets.number import NumberWidget
from senaite.multiwellplate import messageFactory as _
from zope import schema
from zope.interface import Interface

from .ruleheaderfield import DEFAULT_RULE_HEADER
from .ruleheaderfield import RuleHeaderField
from senaite.multiwellplate.z3cform.widgets.ruleheader import RuleHeaderWidgetFactory


class IFieldRecordSchema(Interface):
    """DataGrid Row for field record
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


class IRuleRecordSchema(Interface):
    """DataGrid Row for field record
    """

    directives.widget(
        "rule_header",
        RuleHeaderWidgetFactory,
        style=u"width: 150px!important;"
    )
    rule_header = RuleHeaderField(
        title=_(
            u"label_rule_header",
            default=u"Rule header"
        ),
        required=False,
        default=DEFAULT_RULE_HEADER,
    )

    directives.widget("rule_body", style=u"width: 150px!important;")
    rule_body = schema.Text(
        title=_(
            u"label_rule_body",
            default=u"Rule body"
        ),
        required=False,
        default=u""
    )


class MultiWellPlateConfigSchema(model.Schema):
    multiwell_enabled = schema.Bool(
        title=_(
            u"multiwellplate_enabled_title",
            default=u"Enable MultiWell Plate"
        ),
        required=True,
        default=False,
    )

    directives.widget("cols_count", NumberWidget)
    cols_count = schema.Int(
        title=_(
            u"multiwellplate_cols_count_title",
            default=u"Cols count"
        ),
        required=True,
        default=12,
    )

    directives.widget("rows_count", NumberWidget)
    rows_count = schema.Int(
        title=_(
            u"multiwellplate_rows_count_title",
            default=u"Rows count"
        ),
        required=True,
        default=8,
    )

    directives.widget(
        "fields",
        DataGridWidgetFactory,
        allow_insert=True,
        allow_delete=True,
        allow_reorder=False,
        auto_append=True)
    fields = DataGridField(
        title=_(u"label_fields", default=u"Field parameters"),
        description=_(u"description_fields",
                      default=u"Fields includes to analyses objects"),
        value_type=DataGridRow(schema=IFieldRecordSchema),
        required=False,
        default=[
            {
                "keyword": u"uid",
                "title": u"UID",
                "value": u"obj.UID()",
                "filterable": False,
                "sortable": False,
                "groupable": False,
                "display_mode": "none",
            },
            {
                "keyword": u"keyword",
                "title": u"Service Keyword",
                "value": u"obj.Keyword",
                "filterable": True,
                "sortable": True,
                "groupable": True,
                "display_mode": "title",
            },
            {
                "keyword": u"serviceTitle",
                "title": u"Service Title",
                "value": u"obj.getService().Title()",
                "filterable": True,
                "sortable": False,
                "groupable": False,
                "display_mode": "description",
            },
            {
                "keyword": u"clientId",
                "title": u"Client ID",
                "value": u"obj.getRequest().getClient().getClientID()",
                "filterable": True,
                "sortable": True,
                "groupable": True,
                "display_mode": "title",

            },
            {
                "keyword": u"clientName",
                "title": u"Client Name",
                "value": u"obj.getRequest().getClient().Title()",
                "filterable": True,
                "sortable": True,
                "groupable": True,
                "display_mode": "description",
            },
            {
                "keyword": u"sampleId",
                "title": u"Sample ID",
                "value": u"obj.getRequest().getId()",
                "filterable": True,
                "sortable": True,
                "groupable": True,
                "display_mode": "title",
            },
        ],
    )

    directives.widget(
        "rules",
        DataGridWidgetFactory,
        allow_insert=True,
        allow_delete=True,
        allow_reorder=False,
        auto_append=True)
    rules = DataGridField(
        title=_(u"label_rules", default=u"Positioning rules"),
        description=_(u"description_fields",
                      default=u"Fields includes to analyses objects"),
        value_type=DataGridRow(schema=IRuleRecordSchema),
        required=False,
        default=[],
    )
