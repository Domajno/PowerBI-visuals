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

/// <reference path="../_references.ts"/>

module powerbi.visuals.sampleDataViews {
    import ValueType = powerbi.ValueType;
    import PrimitiveType = powerbi.PrimitiveType;
    
    export class SimpleHistogramTableData extends SampleDataViews implements ISampleDataViewsMethods {

        public name: string = "SimpleHistogramTableData";
        public displayName: string = "Simple histogram table data";

        public visuals: string[] = ['labeledHistogram',
        ];

        private sampleData: any[][] = [["Qatar", 86.9], ["Ethiopia", 79.4], ["Cayman Islands", 77.8], ["Iceland", 77], ["Viet Nam", 76], ["Tanzania", 75.7], ["Thailand", 71], ["Norway", 68.7], ["China", 68.6], ["Paraguay", 66.8], ["Sweden", 65.7], ["Switzerland", 65.3], ["Malaysia", 65], ["Russian Federation", 64.8], ["New Zealand", 64.1], ["Indonesia", 62.7], ["Canada", 61.8], ["Australia", 61.3], ["Brazil", 61.2], ["Netherlands", 60.8], ["Finland", 60.1], ["El Salvador", 59.9], ["Israel", 59.7], ["Colombia", 59.6], ["Ecuador", 59.5], ["Korea", 59.5], ["Uruguay", 59.5], ["Philippines", 59.4], ["Hong Kong", 59.1], ["Trinidad Tobago", 59.1], ["Barbados", 58.9], ["United States", 58.6], ["Austria", 58.5], ["United Kingdom", 58.4], ["Guatemala", 58.3], ["Denmark", 58], ["Mexico", 57.5], ["Kyrgyzstan", 57.3], ["Germany", 57.1], ["Japan", 56.9], ["Chile", 56], ["Estonia", 56], ["Luxembourg", 55.9], ["Czech Republic", 55.2], ["Costa Rica", 54.7], ["Dominican Republic", 54.6], ["Cyprus", 53.3], ["Ireland", 52.4], ["Latvia", 52.4], ["Hungary", 51.6], ["Slovenia", 51.5], ["Lithuania", 51.2], ["Romania", 51.1], ["Saudi Arabia", 51.1], ["France", 50.9], ["Slovakia", 50.9], ["Poland", 50.2], ["Namibia", 50], ["Malta", 49.8], ["Portugal", 49.7], ["Lesotho", 49.2], ["Belgium", 49], ["Bulgaria", 46.9], ["Turkey", 45.9], ["Albania", 44.5], ["Spain", 44.4], ["Italy", 43], ["Croatia", 42.1], ["Egypt", 42.1], ["South Africa", 40], ["Macedonia", 39.7], ["Greece", 38.4], ["Serbia", 37.7], ["Palestine", 33.4]];

        public getDataViews(): DataView[] {
            var dataTypeNumber = ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Double);
            var dataTypeString = ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Text);            

            var groupSource1: DataViewMetadataColumn = { displayName: 'group1', type: dataTypeString, index: 0 };

            var measureSource1: DataViewMetadataColumn = { displayName: 'measure1', type: dataTypeNumber, isMeasure: true, index: 1, objects: { general: { formatString: '#' } } };

            return [{
                metadata: { columns: [groupSource1, measureSource1] },
                table: {
                    columns: [groupSource1, measureSource1],
                    rows: this.sampleData
                }
            }];
        }

        public randomize(): void {
            this.sampleData = this.sampleData.map((item) => {
                return [item[0], Math.random()*100];
            });
        }
        
    }
}