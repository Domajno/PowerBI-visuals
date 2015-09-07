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
                            displayName: 'Fill'
                        },
                        size: {
                            type: { numeric: true },
                            displayName: 'Size'
                        }
                    },
                }
            },
        };

        private element: JQuery;
        private selectionManager: SelectionManager;
        private svg: D3.Selection;
        private chart: D3.Selection;

        // Convert a DataView into a view model
        public static converter(dataView: DataView): HistogramDatapoint[]{
            var data = (dataView.table && dataView.table.rows && dataView.table.rows.map) ?
                dataView.table.rows.map(function (row) {
                    return {
                        label: row[0],
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
            this.selectionManager = new SelectionManager({ hostServices: options.host });
            this.svg = d3.select(this.element.get(0))
                .append('svg')
                .classed('labeled-histogram', true)
                .attr('viewBox', '0 0 1200 800');
            this.chart = this.svg.append('g').attr('transform', 'translate(20, 20)');
        }

        /* Called for data, size, formatting changes*/ 
        public update(options: VisualUpdateOptions) {
            if (!options.dataViews || !options.dataViews[0]) return; // or clear the view, display an error, etc.
          
            var dataPoints = LabeledHistogram.converter(options.dataViews[0]);

            this.chart.selectAll('*').remove();

            this.svg
                .attr({
                    'height': options.viewport.height,
                    'width': options.viewport.width
                });

            var histogram = d3.layout.histogram().value(function (d) { return d.value; })(dataPoints);

            var itemHeight = 20,
                itemWidth = 150,
                chartHeight = 800,
                columnPadding = 10,
                marginBottom = 40;

            var columns = this.chart.selectAll('g')
                .data(histogram)
                .enter()
                .append('g')
                .attr('transform', function (d, i) { return 'translate(' + (itemWidth * i) + ')'; });

            columns.selectAll('text')
                .data(function (d) { return d; })
                .enter()
                .append('text')
                .attr('y', function (d, i) { return itemHeight * i; })
                .attr('textLength', itemWidth - columnPadding)
                .attr('lengthAdjust', 'spacingAndGlyphs')
                .attr('x', columnPadding / 2)
                .style('text-transform', 'uppercase')
                .style('font-family', 'sans-serif')
                .text(function (d) { return d.label; });

            columns.each(function (column, i) {

                var height = this.getBBox().height;
                d3.select(this)
                    .attr('transform', function (d) { return 'translate(' + (itemWidth * i) + ', ' + (chartHeight - height - marginBottom) + ')'; })
                    .insert('rect', 'text')
                    .attr('width', itemWidth - 4)
                    .attr('height', height + itemHeight/2)
                    .attr('x', 2)
                    .attr('y', -itemHeight)
                    .style('fill', '#E0FDC5');
            });

            TooltipManager.addTooltip(columns.selectAll('text'), (tooltipEvent: TooltipEvent) => tooltipEvent.data.toolTipInfo);

            // Draw x-axis
            var min = histogram[0].x,
                max = histogram[histogram.length - 1].x + histogram[histogram.length - 1].dx,
                ticks = histogram.map(function (bin) { return bin.x; }).concat(max),
                axisScale = d3.scale.linear().domain([min, max]).range([0, histogram.length * itemWidth]),
                xAxis = d3.svg.axis().scale(axisScale).tickValues(ticks),
                xAxisGroup = this.chart.append("g").call(xAxis);
            xAxisGroup.attr('transform', 'translate(0, ' + (chartHeight - 40) + ')');
        }

        /*About to remove your visual, do clean up here */ 
        public destroy() {
            this.svg.remove();
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