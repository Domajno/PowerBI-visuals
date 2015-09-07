/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved. 
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *   
 *  The above copyright notice and this permission notice shall be included in 
 *  all copies or substantial portions of the Software.
 *   
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

/* Please make sure that this path is correct */
/// <reference path="../_references.ts"/>

module powerbi.visuals {

    export interface HistogramDatapoint {
        label: string;
        value: number;
        toolTipInfo: TooltipDataItem[];
    };

    export class LabeledHistogram implements IVisual {
		/**
		  * Informs the System what it can do
		  * Fields, Formatting options, data reduction & QnA hints
		  */
        public static capabilities: VisualCapabilities = {
            dataRoles: [
                {
                    name: 'Category',
                    kind: powerbi.VisualDataRoleKind.Grouping,
                },
                {
                    name: 'Measure',
                    kind: powerbi.VisualDataRoleKind.Measure,
                },
            ],
            dataViewMappings: [{
                categories: {
                    for: { in: 'Category' },
                    dataReductionAlgorithm: { top: {} }
                },
                values: {
                    select: [{ bind: { to: 'Y' } }]
                },
            }],
            objects: {
                general: {
                    displayName: data.createDisplayNameGetter('Visual_General'),
                    properties: {
                        fill: {
                            type: { fill: { solid: { color: true } } },
                            displayName: 'Columns Fill'
                        }
                    },
                }
            },
        };

        private static VisualClassName = 'labeledHistogram';
        private static ViewBox = '0 0 1240 840';
        private element: JQuery;
        private svg: D3.Selection;
        private chart: D3.Selection;
        private dataView: DataView;

        // Convert a DataView into a view model
        public static converter(dataView: DataView): HistogramDatapoint[] {
            var data = (dataView.table && dataView.table.rows && dataView.table.rows.map) ?
                dataView.table.rows.map((row) => {
                    return {
                        label: row[0].toString().substring(0, 20),
                        value: row[1],
                        toolTipInfo: [{
                            displayName: '',
                            value: row[0] + ' ' + row[1]
                        }]
                    };
                })
                : [];
            return data;
        }

        /* One time setup*/
        public init(options: VisualInitOptions): void {

            this.element = options.element;

            this.svg = d3.select(this.element.get(0))
                .append('svg')
                .classed(LabeledHistogram.VisualClassName, true)
                .attr('viewBox', LabeledHistogram.ViewBox);

            this.chart = this.svg.append('g').attr('transform', SVGUtil.translate(20, 20));
        }

        /* Called for data, size, formatting changes*/
        public update(options: VisualUpdateOptions) {

            if (!options.dataViews || !options.dataViews[0]) return;
          
            var dataView = this.dataView = options.dataViews[0];
            var dataPoints = LabeledHistogram.converter(dataView);
            var fillColor = LabeledHistogram.getFill(dataView).solid.color;

            this.chart.selectAll('*').remove();

            this.svg
                .attr({
                    'height': options.viewport.height,
                    'width': options.viewport.width
                });

            var histogram = d3.layout.histogram().value((d) => d.value)(dataPoints);

            var itemWidth = Math.min(150, Math.floor(1200 / histogram.length)),
                chartHeight = 800,
                itemHeight = Math.min(20, Math.floor(chartHeight / histogram.reduce((a, b) => Math.max(a, b.length), 0))),
                columnPadding = 10,
                marginBottom = 40;

            var columns = this.chart.selectAll('g')
                .data(histogram)
                .enter()
                .append('g')
                .attr('transform', (d, i) => SVGUtil.translate(itemWidth * i, 0));

            columns.selectAll('text')
                .data((d) => d)
                .enter()
                .append('text')
                .attr('y', (d, i) => { return itemHeight * i; })
                .attr('textLength', itemWidth - columnPadding)
                .attr('lengthAdjust', 'spacingAndGlyphs')
                .attr('x', columnPadding / 2)
                .style('text-transform', 'uppercase')
                .style('font-family', 'sans-serif')
                .text((d) => d.label);

            columns.each(function (column, i) {
                var height = column.length * itemHeight;
                d3.select(this)
                    .attr('transform', (d) => SVGUtil.translate((itemWidth * i), (chartHeight - height - marginBottom)))
                    .insert('rect', 'text')
                    .attr('width', itemWidth - 4)
                    .attr('height', height + itemHeight / 2)
                    .attr('x', 2)
                    .attr('y', -itemHeight)
                    .style('fill', fillColor);
            });

            // Add tooltip
            TooltipManager.addTooltip(columns.selectAll('text'), (tooltipEvent: TooltipEvent) => tooltipEvent.data.toolTipInfo);

            // Draw x-axis
            var min = histogram.length > 0 ? histogram[0].x : 0,
                max = histogram.length > 0 ? (histogram[histogram.length - 1].x + histogram[histogram.length - 1].dx) : 0,
                ticks = histogram.map((bin) => bin.x).concat(max),
                axisScale = d3.scale.linear().domain([min, max]).range([0, histogram.length * itemWidth]),
                xAxis = d3.svg.axis().scale(axisScale).tickValues(ticks),
                xAxisGroup = this.chart.append("g").call(xAxis);
            xAxisGroup.attr('transform', SVGUtil.translate(0, (chartHeight - 45)));
        }

        /*About to remove your visual, do clean up here */
        public destroy() {
            this.svg.remove();
        }

        private static getFill(dataView: DataView): Fill {
            if (dataView) {
                var objects = dataView.metadata.objects;
                if (objects) {
                    var general = objects['general'];
                    if (general) {
                        var fill = <Fill>general['fill'];
                        if (fill)
                            return fill;
                    }
                }
            }
            return { solid: { color: '#C9FFD8' } };
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
            var instances: VisualObjectInstance[] = [];
            var dataView = this.dataView;
            switch (options.objectName) {
                case 'general':
                    var general: VisualObjectInstance = {
                        objectName: 'general',
                        displayName: 'General',
                        selector: null,
                        properties: {
                            fill: LabeledHistogram.getFill(dataView)
                        }
                    };
                    instances.push(general);
                    break;
            }

            return instances;
        }
    }
}

/* Creating IVisualPlugin that is used to represent IVisual. */
//
// Uncomment it to see your plugin in "PowerBIVisualsPlayground" plugins list
// Remember to finally move it to plugins.ts
//
module powerbi.visuals.plugins {
    export var labeledHistogram: IVisualPlugin = {
        name: '00labeledHistogram',
        capabilities: LabeledHistogram.capabilities,
        create: () => new LabeledHistogram()
    };
}